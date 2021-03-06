import { clipboard } from "electron";
import { push as pushHistory, goBack } from "react-router-redux";
import eq from "lodash/fp/eq";

import * as wallet from "wallet";
import * as selectors from "selectors";
import { getWalletCfg } from "config";
import { pause } from "helpers";
import { TransactionDetails } from "middleware/walletrpc/api_pb";

import {
  getNextAddressAttempt,
  loadActiveDataFiltersAttempt,
  rescanAttempt,
  stopAutoBuyerAttempt,
  getTicketBuyerConfigAttempt
} from "../ControlActions";
import { transactionNtfnsStart, accountNtfnsStart } from "../NotificationActions";
import { updateStakepoolPurchaseInformation, setStakePoolVoteChoices } from "../StakePoolActions";
import { getDecodeMessageServiceAttempt } from "../DecodeMessageActions";
import { showSidebarMenu, showSidebar } from "../SidebarActions";
import { getStartupStats } from "../StatisticsActions";

import * as T from "./action-types";
import findImmatureTransactions from "./find-immature-transactions";
import getTransactions from "./get-transactions";
import { transactionsMaturingHeights, filterTransactions } from "./helpers";

export { default as getTransactions } from "./get-transactions";
export * from "./action-types";

export const goToTransactionHistory = () => dispatch => {
  dispatch(pushHistory("/transactions/history"));
};

export const goToMyTickets = () => dispatch => {
  dispatch(pushHistory("/tickets/mytickets"));
};

function* startupFlow() {
  yield loadActiveDataFiltersAttempt;
  yield () => getNextAddressAttempt(0);
  yield getTicketPriceAttempt;
  yield getPingAttempt;
  yield getNetworkAttempt;
  yield transactionNtfnsStart;
  yield accountNtfnsStart;
  yield updateStakepoolPurchaseInformation;
  yield getDecodeMessageServiceAttempt;
}

const goHomeCb = dispatch => () => {
  pause(1000).then(() => {
    dispatch(pushHistory("/home"));
    dispatch(showSidebar());
    dispatch(showSidebarMenu());
  });
};

function getWalletServiceSuccess(walletService) {
  return async (dispatch, getState) => {
    dispatch({ walletService, type: T.GETWALLETSERVICE_SUCCESS });
    await pause(500);
    const startupOperations = [];
    for (const operation of startupFlow()) {
      const activeOp = operation();
      dispatch(activeOp);
      startupOperations.push(activeOp);
    }

    // Check here to see if wallet was just created from an existing
    // seed.  If it was created from a newly generated seed there is no
    // expectation of address use so rescan can be skipped.
    const {
      walletCreateExisting,
      walletCreateResponse,
      fetchHeadersResponse
    } = getState().walletLoader;

    if (walletCreateExisting) {
      await Promise.all(startupOperations);
      dispatch(rescanAttempt(0)).then(goHomeCb(dispatch));
    } else if (
      walletCreateResponse === null &&
      fetchHeadersResponse !== null &&
      fetchHeadersResponse.getFirstNewBlockHeight() !== 0
    ) {
      await Promise.all(startupOperations);
      await pause(2500);
      dispatch(rescanAttempt(fetchHeadersResponse.getFirstNewBlockHeight())).then(
        goHomeCb(dispatch)
      );
    } else {
      dispatch(getStartupWalletInfo()).then(goHomeCb(dispatch));
    }
  };
}

export const getStartupWalletInfo = () => async dispatch => {
  dispatch({ type: T.GETSTARTUPWALLETINFO_ATTEMPT });
  await Promise.all([dispatch(getStakeInfoAttempt()), dispatch(getTicketsInfoAttempt())]);
  return new Promise(async (resolve, reject) => {
    try {
      await dispatch(getAccountsAttempt(true));
      await dispatch(getMostRecentRegularTransactions());
      await dispatch(getMostRecentStakeTransactions());
      await dispatch(getMostRecentTransactions());
      dispatch(getStartupStats());
      dispatch(findImmatureTransactions());
      dispatch({ type: T.GETSTARTUPWALLETINFO_SUCCESS });
      resolve();
    } catch (error) {
      dispatch({ error, type: T.GETSTARTUPWALLETINFO_FAILED });
      reject(error);
    }
  });
};

export const getWalletServiceAttempt = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: T.GETWALLETSERVICE_ATTEMPT });
  wallet
    .getWalletService(selectors.isTestNet(getState()), walletName, address, port)
    .then(walletService => dispatch(getWalletServiceSuccess(walletService)))
    .catch(error => dispatch({ error, type: T.GETWALLETSERVICE_FAILED }));
};

export const getTicketBuyerServiceAttempt = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: T.GETTICKETBUYERSERVICE_ATTEMPT });
  wallet
    .getTicketBuyerService(selectors.isTestNet(getState()), walletName, address, port)
    .then(async ticketBuyerService => {
      dispatch({ ticketBuyerService, type: T.GETTICKETBUYERSERVICE_SUCCESS });
      await pause(10);
      dispatch(getTicketBuyerConfigAttempt());
      dispatch(stopAutoBuyerAttempt());
    })
    .catch(error => dispatch({ error, type: T.GETTICKETBUYERSERVICE_FAILED }));
};

export const getAccountNumbersBalances = accountNumbers => dispatch => {
  accountNumbers.forEach(a => dispatch(getBalanceUpdateAttempt(a, 0)));
};

const getAccountsBalances = accounts => async (dispatch, getState) => {
  const balances = [];
  const {
    daemon: { hiddenAccounts }
  } = getState();

  for (const account of accounts) {
    const accountNumber = account.getAccountNumber();
    const hidden = hiddenAccounts.findIndex(eq(accountNumber)) > -1;
    const HDPath = `m/44'/${selectors.isMainNet(getState()) ? "0" : "1"}'/${accountNumber}'`;

    try {
      const response = await wallet.getBalance(
        selectors.walletService(getState()),
        accountNumber,
        0
      );
      balances.push({
        accountNumber,
        hidden,
        HDPath,
        accountName: account.getAccountName(),
        externalKeys: account.getExternalKeyCount(),
        internalKeys: account.getInternalKeyCount(),
        importedKeys: account.getImportedKeyCount(),
        total: response.getTotal(),
        spendable: response.getSpendable(),
        immatureReward: response.getImmatureReward(),
        immatureStakeGeneration: response.getImmatureStakeGeneration(),
        lockedByTickets: response.getLockedByTickets(),
        votingAuthority: response.getVotingAuthority()
      });
    } catch (error) {
      dispatch({ error, type: T.GETBALANCE_FAILED });
    }
  }
  dispatch({ balances, type: T.GETBALANCE_SUCCESS });
};

const getBalanceUpdateSuccess = (accountNumber, getBalanceResponse) => dispatch => {
  const updatedBalance = {
    accountNumber,
    total: getBalanceResponse.getTotal(),
    spendable: getBalanceResponse.getSpendable(),
    immatureReward: getBalanceResponse.getImmatureReward(),
    immatureStakeGeneration: getBalanceResponse.getImmatureStakeGeneration(),
    lockedByTickets: getBalanceResponse.getLockedByTickets(),
    votingAuthority: getBalanceResponse.getVotingAuthority()
  };
  dispatch(updateAccount(updatedBalance));
};

export const getBalanceUpdateAttempt = (accountNumber, requiredConfs) => (dispatch, getState) =>
  wallet
    .getBalance(selectors.walletService(getState()), accountNumber, requiredConfs)
    .then(resp => dispatch(getBalanceUpdateSuccess(accountNumber, resp)))
    .catch(error => dispatch({ error, type: T.GETBALANCE_FAILED }));

export const getAccountNumberAttempt = accountName => (dispatch, getState) => {
  dispatch({ type: T.GETACCOUNTNUMBER_ATTEMPT });
  wallet
    .getAccountNumber(selectors.walletService(getState()), accountName)
    .then(resp => dispatch({ getAccountNumberResponse: resp, type: T.GETACCOUNTNUMBER_SUCCESS }))
    .catch(error => dispatch({ error, type: T.GETACCOUNTNUMBER_FAILED }));
};

function getNetworkSuccess(getNetworkResponse) {
  return (dispatch, getState) => {
    const { testnet, mainnet } = getState().grpc;
    const { network } = getState().daemon;
    const currentNetwork = getNetworkResponse.getActiveNetwork();
    // XXX remove network magic numbers here
    let networkStr = "";
    if (
      (currentNetwork === testnet && network === "testnet") ||
      (currentNetwork === mainnet && network === "mainnet")
    ) {
      networkStr = network;
      getNetworkResponse.networkStr = networkStr;
      dispatch({ getNetworkResponse, type: T.GETNETWORK_SUCCESS });
    } else {
      dispatch({ error: "Invalid network detected", type: T.GETNETWORK_FAILED });
      pause(1000).then(() => {
        dispatch(pushHistory("/walletError"));
      });
    }
  };
}

export const getNetworkAttempt = () => (dispatch, getState) => {
  dispatch({ type: T.GETNETWORK_ATTEMPT });
  wallet
    .getNetwork(selectors.walletService(getState()))
    .then(resp => {
      dispatch(getNetworkSuccess(resp));
    })
    .catch(error => {
      dispatch({ error, type: T.GETNETWORK_FAILED });
      pause(1000).then(() => {
        dispatch(pushHistory("/walletError"));
      });
    });
};

export const getPingAttempt = () => (dispatch, getState) =>
  wallet
    .doPing(selectors.walletService(getState()))
    .then(() => {
      pause(10000).then(() => {
        dispatch(getPingAttempt());
      });
    })
    .catch(error => {
      const {
        daemon: { shutdownRequested, goBack }
      } = getState();

      dispatch({ error, type: T.GETPING_FAILED });
      if (!(shutdownRequested || goBack)) {
        pause(1000).then(() => {
          dispatch(pushHistory("/walletError"));
        });
      }
    });

export const getStakeInfoAttempt = () => (dispatch, getState) => {
  dispatch({ type: T.GETSTAKEINFO_ATTEMPT });
  return wallet
    .getStakeInfo(selectors.walletService(getState()))
    .then(resp => {
      const { getStakeInfoResponse } = getState().grpc;
      dispatch({ getStakeInfoResponse: resp, type: T.GETSTAKEINFO_SUCCESS });
      const checkedFields = [
        "getExpired",
        "getLive",
        "getMissed",
        "getOwnMempoolTix",
        "getRevoked",
        "getVoted"
      ];
      const reloadTickets = getStakeInfoResponse
        ? checkedFields.reduce((a, v) => a || getStakeInfoResponse[v]() !== resp[v](), false)
        : false;

      if (reloadTickets) {
        // TODO: once we switch to fully streamed getTickets(), just invalidate
        // the current ticket list.
        setTimeout(() => {
          dispatch(getTicketsInfoAttempt());
        }, 1000);
      }
    })
    .catch(error => dispatch({ error, type: T.GETSTAKEINFO_FAILED }));
};

export const getTicketPriceAttempt = () => (dispatch, getState) => {
  dispatch({ type: T.GETTICKETPRICE_ATTEMPT });
  wallet
    .getTicketPrice(selectors.walletService(getState()))
    .then(res => {
      dispatch({ getTicketPriceResponse: res, type: T.GETTICKETPRICE_SUCCESS });
    })
    .catch(error => dispatch({ error, type: T.GETTICKETPRICE_FAILED }));
};

export const getAccountsAttempt = startup => async (dispatch, getState) => {
  dispatch({ type: T.GETACCOUNTS_ATTEMPT });
  try {
    const response = await wallet.getAccounts(selectors.walletService(getState()));
    if (startup) {
      dispatch(getAccountsBalances(response.getAccountsList()));
    }
    dispatch({ accounts: response.getAccountsList(), response, type: T.GETACCOUNTS_SUCCESS });
  } catch (error) {
    dispatch({ error, type: T.GETACCOUNTS_FAILED });
  }
};

export function updateAccount(account) {
  return (dispatch, getState) => {
    const {
      grpc: { balances }
    } = getState();
    const existingAccount = balances.find(a => a.accountNumber === account.accountNumber);
    const updatedAccount = { ...existingAccount, ...account };
    const updatedBalances = balances.map(
      a => (a.accountNumber === account.accountNumber ? updatedAccount : a)
    );
    if (!existingAccount) {
      updatedBalances.push(updatedAccount);
    }

    dispatch({ balances: updatedBalances, type: T.GETBALANCE_SUCCESS });
  };
}

export function hideAccount(accountNumber) {
  return (dispatch, getState) => {
    const {
      daemon: { walletName, hiddenAccounts }
    } = getState();
    const updatedHiddenAccounts = [...hiddenAccounts];
    if (updatedHiddenAccounts.indexOf(accountNumber) === -1) {
      updatedHiddenAccounts.push(accountNumber);
    }
    const cfg = getWalletCfg(selectors.isTestNet(getState()), walletName);
    cfg.set("hiddenaccounts", updatedHiddenAccounts);
    dispatch({ hiddenAccounts: updatedHiddenAccounts, type: T.UPDATEHIDDENACCOUNTS });
    dispatch(updateAccount({ accountNumber, hidden: true }));
  };
}

export function showAccount(accountNumber) {
  return (dispatch, getState) => {
    const {
      daemon: { walletName, hiddenAccounts }
    } = getState();
    const updatedHiddenAccounts = [];
    for (let i = 0; i < hiddenAccounts.length; i++) {
      if (hiddenAccounts[i] !== accountNumber) {
        updatedHiddenAccounts.push(hiddenAccounts[i]);
      }
    }
    const cfg = getWalletCfg(selectors.isTestNet(getState()), walletName);
    cfg.set("hiddenaccounts", updatedHiddenAccounts);
    dispatch({ hiddenAccounts: updatedHiddenAccounts, type: T.UPDATEHIDDENACCOUNTS });
    dispatch(updateAccount({ accountNumber, hidden: false }));
  };
}

export const getTicketsInfoAttempt = () => (dispatch, getState) => {
  const {
    grpc: { getTicketsRequestAttempt }
  } = getState();
  if (getTicketsRequestAttempt) {
    return;
  }
  // using 0..-1 requests all+unmined tickets
  const startRequestHeight = 0;
  const endRequestHeight = -1;

  dispatch({ type: T.GETTICKETS_ATTEMPT });
  return wallet
    .getTickets(selectors.walletService(getState()), startRequestHeight, endRequestHeight)
    .then(tickets => {
      setTimeout(() => {
        dispatch({ tickets, type: T.GETTICKETS_COMPLETE });
      }, 1000);
    })
    .catch(error => console.error(`${error} Please try again`));
};

// filterTransactions filters a list of transactions given a filtering object.
//
// Currently supported filters in the filter object:
// - type (array): Array of types a transaction must belong to, to be accepted.
// - direction (string): A string of one of the allowed directions for regular
//   transactions (sent/received/transfered)
//
// If empty, all transactions are accepted.

function checkAccountsToUpdate(txs, accountsToUpdate) {
  txs.forEach(tx => {
    tx.tx.getCreditsList().forEach(credit => {
      if (accountsToUpdate.find(eq(credit.getAccount())) === undefined) {
        accountsToUpdate.push(credit.getAccount());
      }
    });
    tx.tx.getDebitsList().forEach(debit => {
      if (accountsToUpdate.find(eq(debit.getPreviousAccount())) === undefined) {
        accountsToUpdate.push(debit.getPreviousAccount());
      }
    });
  });
  return accountsToUpdate;
}

function checkForStakeTransactions(txs) {
  let stakeTxsFound = false;
  txs.forEach(tx => {
    if (
      tx.type === TransactionDetails.TransactionType.VOTE ||
      tx.type === TransactionDetails.TransactionType.TICKET_PURCHASE ||
      tx.type === TransactionDetails.TransactionType.REVOCATION
    ) {
      stakeTxsFound = true;
    }
  });
  return stakeTxsFound;
}
// newTransactionsReceived should be called when a new set of transactions has
// been received from the wallet (through a notification).
export const newTransactionsReceived = (newlyMinedTransactions, newlyUnminedTransactions) => (
  dispatch,
  getState
) => {
  if (!newlyMinedTransactions.length && !newlyUnminedTransactions.length) {
    return;
  }
  const state = getState();
  let {
    unminedTransactions = [],
    minedTransactions = [],
    recentRegularTransactions = [],
    recentStakeTransactions = []
  } = state.grpc;
  const { transactionsFilter, recentTransactionCount } = state.grpc;

  const chainParams = selectors.chainParams(state);

  // aux maps of [txhash] => tx (used to ensure no duplicate txs)
  const newlyMinedMap = newlyMinedTransactions.reduce((m, v) => {
    m[v.hash] = v;
    return m;
  }, {});
  const newlyUnminedMap = newlyUnminedTransactions.reduce((m, v) => {
    m[v.hash] = v;
    return m;
  }, {});

  const minedMap = minedTransactions.reduce((m, v) => {
    m[v.hash] = v;
    return m;
  }, {});
  const unminedMap = unminedTransactions.reduce((m, v) => {
    m[v.hash] = v;
    return m;
  }, {});

  const unminedDupeCheck = newlyUnminedTransactions.filter(
    tx => !minedMap[tx.hash] && !unminedMap[tx.hash]
  );

  let accountsToUpdate = [];
  accountsToUpdate = checkAccountsToUpdate(unminedDupeCheck, accountsToUpdate);
  accountsToUpdate = checkAccountsToUpdate(newlyMinedTransactions, accountsToUpdate);
  accountsToUpdate = Array.from(new Set(accountsToUpdate));
  accountsToUpdate.forEach(v => dispatch(getBalanceUpdateAttempt(v, 0)));

  if (
    checkForStakeTransactions(unminedDupeCheck) ||
    checkForStakeTransactions(newlyMinedTransactions)
  ) {
    dispatch(getStakeInfoAttempt());
  }
  const filterTx = filterTransactions(transactionsFilter);

  unminedTransactions = filterTx([
    ...newlyUnminedTransactions,
    ...unminedTransactions.filter(tx => !newlyMinedMap[tx.hash] && !newlyUnminedMap[tx.hash])
  ]);

  const regularTransactionFilter = {
    listDirection: "desc",
    types: [TransactionDetails.TransactionType.REGULAR],
    direction: null
  };

  recentRegularTransactions = filterTransactions(regularTransactionFilter)([
    ...newlyUnminedTransactions,
    ...newlyMinedTransactions,
    ...recentRegularTransactions.filter(tx => !newlyMinedMap[tx.hash] && !newlyUnminedMap[tx.hash])
  ]).slice(0, recentTransactionCount);

  const stakeTransactionFilter = {
    listDirection: "desc",
    types: [
      TransactionDetails.TransactionType.TICKET_PURCHASE,
      TransactionDetails.TransactionType.VOTE,
      TransactionDetails.TransactionType.REVOCATION
    ],
    direction: null
  };

  recentStakeTransactions = filterTransactions(stakeTransactionFilter)([
    ...newlyUnminedTransactions,
    ...newlyMinedTransactions,
    ...recentStakeTransactions.filter(tx => !newlyMinedMap[tx.hash] && !newlyUnminedMap[tx.hash])
  ]).slice(0, recentTransactionCount);

  const { maturingBlockHeights } = getState().grpc;
  const newMaturingHeights = { ...maturingBlockHeights };
  const mergeNewMaturingHeights = hs =>
    Object.keys(hs).forEach(h => {
      const accounts = newMaturingHeights[h] || [];
      hs[h].forEach(a => (accounts.indexOf(a) === -1 ? accounts.push(a) : null));
      newMaturingHeights[h] = accounts;
    });

  mergeNewMaturingHeights(transactionsMaturingHeights(newlyMinedTransactions, chainParams));
  dispatch({ maturingBlockHeights: newMaturingHeights, type: T.MATURINGHEIGHTS_CHANGED });

  // TODO: filter newlyMinedTransactions against minedTransactions if this
  // starts generating a duplicated key error

  if (transactionsFilter.listDirection === "desc") {
    minedTransactions = [...newlyMinedTransactions, ...minedTransactions];
  } else {
    minedTransactions = [...minedTransactions, ...newlyMinedTransactions];
  }
  minedTransactions = filterTx(minedTransactions, transactionsFilter);

  dispatch({
    unminedTransactions,
    minedTransactions,
    newlyUnminedTransactions,
    newlyMinedTransactions,
    recentRegularTransactions,
    recentStakeTransactions,
    type: T.NEW_TRANSACTIONS_RECEIVED
  });

  if (newlyMinedTransactions.length > 0) {
    dispatch(getStartupStats(newlyMinedTransactions, state.statistics.fullBalances));
  }
};

// getMostRecentRegularTransactions clears the transaction filter and refetches
// the first page of transactions. This is used to get and store the initial
// list of recent transactions.
export const getMostRecentRegularTransactions = () => dispatch => {
  const defaultFilter = {
    listDirection: "desc",
    types: [TransactionDetails.TransactionType.REGULAR],
    direction: null
  };
  return dispatch(changeTransactionsFilter(defaultFilter));
};

export const getMostRecentStakeTransactions = () => dispatch => {
  const defaultFilter = {
    listDirection: "desc",
    types: [
      TransactionDetails.TransactionType.TICKET_PURCHASE,
      TransactionDetails.TransactionType.VOTE,
      TransactionDetails.TransactionType.REVOCATION
    ],
    direction: null
  };
  return dispatch(changeTransactionsFilter(defaultFilter));
};

export const getMostRecentTransactions = () => dispatch => {
  const defaultFilter = {
    search: null,
    listDirection: "desc",
    types: [],
    direction: null
  };
  return dispatch(changeTransactionsFilter(defaultFilter));
};

export function changeTransactionsFilter(newFilter) {
  return dispatch => {
    dispatch({ transactionsFilter: newFilter, type: T.CHANGE_TRANSACTIONS_FILTER });
    return dispatch(getTransactions());
  };
}

export function updateBlockTimeSince() {
  return (dispatch, getState) => {
    const { transactionNtfnsResponse } = getState().notifications;
    const { recentBlockTimestamp } = getState().grpc;
    if (
      transactionNtfnsResponse !== null &&
      transactionNtfnsResponse.getAttachedBlocksList().length > 0
    ) {
      const attachedBlocks = transactionNtfnsResponse.getAttachedBlocksList();
      const lastBlockTimestamp = attachedBlocks[0].getTimestamp();
      if (recentBlockTimestamp !== lastBlockTimestamp) {
        dispatch({
          recentBlockTimestamp: lastBlockTimestamp,
          type: T.UPDATETIMESINCEBLOCK
        });
      }
    }
  };
}

export const getAgendaServiceAttempt = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: T.GETAGENDASERVICE_ATTEMPT });
  wallet
    .getAgendaService(selectors.isTestNet(getState()), walletName, address, port)
    .then(agendaService => {
      dispatch({ agendaService, type: T.GETAGENDASERVICE_SUCCESS });
      setTimeout(() => {
        dispatch(getAgendasAttempt());
      }, 10);
    })
    .catch(error => dispatch({ error, type: T.GETAGENDASERVICE_FAILED }));
};

export const getVotingServiceAttempt = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: T.GETVOTINGSERVICE_ATTEMPT });
  wallet
    .getVotingService(selectors.isTestNet(getState()), walletName, address, port)
    .then(votingService => dispatch({ votingService, type: T.GETVOTINGSERVICE_SUCCESS }))
    .catch(error => dispatch({ error, type: T.GETVOTINGSERVICE_FAILED }));
};

export const getAgendasAttempt = () => (dispatch, getState) => {
  dispatch({ type: T.GETAGENDAS_ATTEMPT });
  wallet
    .getAgendas(selectors.agendaService(getState()))
    .then(agendas => dispatch({ agendas, type: T.GETAGENDAS_SUCCESS }))
    .catch(error => dispatch({ error, type: T.GETAGENDAS_FAILED }));
};

export const getVoteChoicesAttempt = stakePool => (dispatch, getState) => {
  dispatch({ type: T.GETVOTECHOICES_ATTEMPT });
  wallet
    .getVoteChoices(selectors.votingService(getState()))
    .then(voteChoices => {
      dispatch({ voteChoices, type: T.GETVOTECHOICES_SUCCESS });
      dispatch(setStakePoolVoteChoices(stakePool, voteChoices));
    })
    .catch(error => dispatch({ error, type: T.GETVOTECHOICES_FAILED }));
};

export const setVoteChoicesAttempt = (stakePool, agendaId, choiceId) => (dispatch, getState) => {
  dispatch({ payload: { agendaId, choiceId }, type: T.SETVOTECHOICES_ATTEMPT });
  wallet
    .setAgendaVote(selectors.votingService(getState()), agendaId, choiceId)
    .then(response => {
      dispatch({ response, type: T.SETVOTECHOICES_SUCCESS });
      dispatch(getVoteChoicesAttempt(stakePool));
    })
    .catch(error => dispatch({ error, type: T.SETVOTECHOICES_FAILED }));
};

export const getMessageVerificationServiceAttempt = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: T.GETMESSAGEVERIFICATIONSERVICE_ATTEMPT });
  wallet
    .getMessageVerificationService(selectors.isTestNet(getState()), walletName, address, port)
    .then(messageVerificationService =>
      dispatch({ messageVerificationService, type: T.GETMESSAGEVERIFICATIONSERVICE_SUCCESS })
    )
    .catch(error => dispatch({ error, type: T.GETMESSAGEVERIFICATIONSERVICE_FAILED }));
};

export const listenForAppReloadRequest = cb => () => wallet.onAppReloadRequested(cb);

export const showTicketList = status => dispatch =>
  dispatch(pushHistory(`/tickets/mytickets/${status}`));

export const goBackHistory = () => dispatch => dispatch(goBack());

export const copySeedToClipboard = mnemonic => dispatch => {
  clipboard.clear();
  clipboard.writeText(mnemonic);
  dispatch({ type: T.SEEDCOPIEDTOCLIPBOARD });
};
