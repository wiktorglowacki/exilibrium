import * as wallet from "wallet";
import * as sel from "selectors";
import { isValidAddress } from "helpers";
import { getStartupWalletInfo, getStakeInfoAttempt } from "./ClientActions";
import {
  ChangePassphraseRequest,
  RenameAccountRequest,
  RescanRequest,
  NextAccountRequest,
  NextAddressRequest,
  ImportPrivateKeyRequest,
  ImportScriptRequest,
  ConstructTransactionRequest,
  SignTransactionRequest,
  PublishTransactionRequest,
  PurchaseTicketsRequest,
  RevokeTicketsRequest,
  LoadActiveDataFiltersRequest,
  StartAutoBuyerRequest,
  StopAutoBuyerRequest,
  TicketBuyerConfigRequest,
  SetAccountRequest,
  SetBalanceToMaintainRequest,
  SetMaxFeeRequest,
  SetMaxPriceAbsoluteRequest,
  SetMaxPriceRelativeRequest,
  SetVotingAddressRequest,
  SetPoolAddressRequest,
  SetPoolFeesRequest,
  SetMaxPerBlockRequest
} from "../middleware/walletrpc/api_pb";
import { getWalletCfg } from "config";

export const GETNEXTADDRESS_ATTEMPT = "GETNEXTADDRESS_ATTEMPT";
export const GETNEXTADDRESS_FAILED = "GETNEXTADDRESS_FAILED";
export const GETNEXTADDRESS_SUCCESS = "GETNEXTADDRESS_SUCCESS";

export function getNextAddressAttempt(accountNum) {
  const request = new NextAddressRequest();
  request.setAccount(accountNum);
  request.setKind(0);
  request.setGapPolicy(NextAddressRequest.GapPolicy.GAP_POLICY_WRAP);
  return (dispatch, getState) => {
    dispatch({ type: GETNEXTADDRESS_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.nextAddress(request, (error, getNextAddressResponse) => {
      if (error) {
        dispatch({ error, type: GETNEXTADDRESS_FAILED });
      } else {
        getNextAddressResponse.accountNumber = accountNum;
        dispatch({ getNextAddressResponse, type: GETNEXTADDRESS_SUCCESS });
      }
    });
  };
}

export const RENAMEACCOUNT_ATTEMPT = "RENAMEACCOUNT_ATTEMPT";
export const RENAMEACCOUNT_FAILED = "RENAMEACCOUNT_FAILED";
export const RENAMEACCOUNT_SUCCESS = "RENAMEACCOUNT_SUCCESS";

export function renameAccountAttempt(accountNumber, newName) {
  const request = new RenameAccountRequest();
  request.setAccountNumber(accountNumber);
  request.setNewName(newName);
  return (dispatch, getState) => {
    dispatch({ type: RENAMEACCOUNT_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.renameAccount(request, (error, renameAccountResponse) => {
      if (error) {
        dispatch({ error, type: RENAMEACCOUNT_FAILED });
      } else {
        const successMsg = "You have successfully updated the account name.";
        setTimeout(
          () =>
            dispatch({
              renameAccountSuccess: successMsg,
              renameAccountResponse,
              type: RENAMEACCOUNT_SUCCESS
            }),
          1000
        );
      }
    });
  };
}

export const RESCAN_ATTEMPT = "RESCAN_ATTEMPT";
export const RESCAN_FAILED = "RESCAN_FAILED";
export const RESCAN_PROGRESS = "RESCAN_PROGRESS";
export const RESCAN_COMPLETE = "RESCAN_COMPLETE";
export const RESCAN_CANCEL = "RESCAN_CANCEL";

export function rescanAttempt(beginHeight) {
  const request = new RescanRequest();
  request.setBeginHeight(beginHeight);
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ request, type: RESCAN_ATTEMPT });
      const { walletService } = getState().grpc;
      const rescanCall = walletService.rescan(request);
      rescanCall.on("data", response => {
        dispatch({ rescanCall, rescanResponse: response, type: RESCAN_PROGRESS });
      });
      rescanCall.on("end", () => {
        dispatch({ type: RESCAN_COMPLETE });
        dispatch(getStartupWalletInfo()).then(resolve);
      });
      rescanCall.on("error", status => {
        status = `${status}`;
        if (status.indexOf("Cancelled") < 0) {
          console.error("Rescan error", status);
          reject(status);
          dispatch({ type: RESCAN_FAILED });
        }
      });
    });
  };
}

export function rescanCancel() {
  return (dispatch, getState) => {
    const { rescanCall } = getState().control;
    rescanCall.cancel();
    dispatch({ type: RESCAN_CANCEL });
  };
}

export const GETNEXTACCOUNT_ATTEMPT = "GETNEXTACCOUNT_ATTEMPT";
export const GETNEXTACCOUNT_FAILED = "GETNEXTACCOUNT_FAILED";
export const GETNEXTACCOUNT_SUCCESS = "GETNEXTACCOUNT_SUCCESS";

export function getNextAccountAttempt(passphrase, accountName) {
  const request = new NextAccountRequest();
  request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
  request.setAccountName(accountName);
  return (dispatch, getState) => {
    dispatch({ type: GETNEXTACCOUNT_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.nextAccount(request, (error, getNextAccountResponse) => {
      if (error) {
        dispatch({ error, type: GETNEXTACCOUNT_FAILED });
      } else {
        const success = `Account - ${accountName} - has been successfully created.`;
        setTimeout(
          () =>
            dispatch({
              getNextAccountResponse,
              type: GETNEXTACCOUNT_SUCCESS,
              successMessage: success
            }),
          1000
        );
      }
    });
  };
}

export const IMPORTPRIVKEY_ATTEMPT = "IMPORTPRIVKEY_ATTEMPT";
export const IMPORTPRIVKEY_FAILED = "IMPORTPRIVKEY_FAILED";
export const IMPORTPRIVKEY_SUCCESS = "IMPORTPRIVKEY_SUCCESS";

export function importPrivateKeyAttempt(passphrase, accountNumber, wif, rescan, scanFrom) {
  return (dispatch, getState) => {
    const request = new ImportPrivateKeyRequest();
    request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
    request.setAccount(accountNumber);
    request.setPrivateKeyWif(wif);
    request.setRescan(rescan);
    request.setScanFrom(scanFrom);
    dispatch({ type: IMPORTPRIVKEY_ATTEMPT });
    const { walletService } = getState().grpc;
    return walletService.importPrivateKey(request, (error, importPrivateKeyResponse) => {
      if (error) {
        dispatch({ error, type: IMPORTPRIVKEY_FAILED });
      } else {
        dispatch({
          importPrivateKeyResponse,
          type: IMPORTPRIVKEY_SUCCESS
        });
      }
    });
  };
}

export const IMPORTSCRIPT_ATTEMPT = "IMPORTSCRIPT_ATTEMPT";
export const IMPORTSCRIPT_FAILED = "IMPORTSCRIPT_FAILED";
export const IMPORTSCRIPT_SUCCESS = "IMPORTSCRIPT_SUCCESS";

function importScriptSuccess(importScriptResponse, votingAddress, cb, willRescan) {
  const message = "Script successfully imported, rescanning now";
  return dispatch => {
    dispatch({
      importScriptSuccess: message,
      importScriptResponse,
      willRescan,
      type: IMPORTSCRIPT_SUCCESS
    });
    if (votingAddress) {
      if (importScriptResponse.getP2shAddress() === votingAddress) {
        dispatch(() => cb());
      } else {
        const error =
          "The stakepool voting address is not the P2SH address of the voting redeem script. This could be due to trying to use a stakepool that is configured for a different wallet. If this is not the case, please report this to the stakepool administrator and the EXCC devs.";
        dispatch(() => cb(error));
      }
    }
  };
}

export function importScriptAttempt(passphrase, script, rescan, scanFrom, votingAddress, cb) {
  const request = new ImportScriptRequest();
  request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
  request.setScript(new Uint8Array(Buffer.from(hexToBytes(script))));
  request.setRescan(false);
  request.setScanFrom(scanFrom);
  request.setRequireRedeemable(true);
  return (dispatch, getState) => {
    dispatch({ type: IMPORTSCRIPT_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.importScript(request, (error, importScriptResponse) => {
      if (error) {
        dispatch({ error, type: IMPORTSCRIPT_FAILED });
        if (votingAddress || cb) {
          if (String(error).indexOf("master private key") !== -1) {
            dispatch(() => cb(error));
          } else {
            error = `${error}. This probably means you are trying to use a stakepool account that is already associated with another wallet.  If you have previously used a voting account, please create a new account and try again.  Otherwise, please set up a new stakepool account for this wallet.`;
            dispatch(() => cb(error));
          }
        }
      } else {
        if (rescan) {
          dispatch(rescanAttempt(0));
        }
        dispatch(importScriptSuccess(importScriptResponse, votingAddress, cb, rescan));
        if (!votingAddress && !cb) {
          setTimeout(() => {
            dispatch(getStakeInfoAttempt());
          }, 1000);
        }
      }
    });
  };
}

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

export const CHANGEPASSPHRASE_ATTEMPT = "CHANGEPASSPHRASE_ATTEMPT";
export const CHANGEPASSPHRASE_FAILED = "CHANGEPASSPHRASE_FAILED";
export const CHANGEPASSPHRASE_SUCCESS = "CHANGEPASSPHRASE_SUCCESS";

export function changePassphraseAttempt(oldPass, newPass, priv) {
  const request = new ChangePassphraseRequest();
  if (priv) {
    request.setKey(ChangePassphraseRequest.Key.PRIVATE);
  } else {
    request.setKey(ChangePassphraseRequest.Key.PUBLIC);
  }
  request.setOldPassphrase(new Uint8Array(Buffer.from(oldPass)));
  request.setNewPassphrase(new Uint8Array(Buffer.from(newPass)));
  return (dispatch, getState) => {
    dispatch({ type: CHANGEPASSPHRASE_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.changePassphrase(request, (error, changePassphraseResponse) => {
      if (error) {
        dispatch({ error, type: CHANGEPASSPHRASE_FAILED });
      } else {
        dispatch({
          changePassphraseResponse,
          type: CHANGEPASSPHRASE_SUCCESS
        });
      }
    });
  };
}

export const LOADACTIVEDATAFILTERS_ATTEMPT = "LOADACTIVEDATAFILTERS_ATTEMPT";
export const LOADACTIVEDATAFILTERS_FAILED = "LOADACTIVEDATAFILTERS_FAILED";
export const LOADACTIVEDATAFILTERS_SUCCESS = "LOADACTIVEDATAFILTERS_SUCCESS";

export function loadActiveDataFiltersAttempt() {
  const request = new LoadActiveDataFiltersRequest();
  return (dispatch, getState) => {
    dispatch({ type: LOADACTIVEDATAFILTERS_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.loadActiveDataFilters(request, (error, response) => {
      if (error) {
        dispatch({ error, type: LOADACTIVEDATAFILTERS_FAILED });
      } else {
        dispatch({ response, type: LOADACTIVEDATAFILTERS_SUCCESS });
      }
    });
  };
}

export const CLEARTX = "CLEARTX";

export function clearTransaction() {
  return { type: CLEARTX };
}

export const SIGNTX_ATTEMPT = "SIGNTX_ATTEMPT";
export const SIGNTX_FAILED = "SIGNTX_FAILED";
export const SIGNTX_SUCCESS = "SIGNTX_SUCCESS";

export function signTransactionAttempt(passphrase, rawTx) {
  const request = new SignTransactionRequest();
  request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
  request.setSerializedTransaction(new Uint8Array(Buffer.from(rawTx)));
  return (dispatch, getState) => {
    dispatch({ type: SIGNTX_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.signTransaction(request, (error, signTransactionResponse) => {
      if (error) {
        dispatch({ error, type: SIGNTX_FAILED });
      } else {
        dispatch({ signTransactionResponse, type: SIGNTX_SUCCESS });
        dispatch(publishTransactionAttempt(signTransactionResponse.getTransaction()));
      }
    });
  };
}

export const PUBLISHTX_ATTEMPT = "PUBLISHTX_ATTEMPT";
export const PUBLISHTX_FAILED = "PUBLISHTX_FAILED";
export const PUBLISHTX_SUCCESS = "PUBLISHTX_SUCCESS";

export function publishTransactionAttempt(tx) {
  const request = new PublishTransactionRequest();
  request.setSignedTransaction(new Uint8Array(Buffer.from(tx)));
  return (dispatch, getState) => {
    dispatch({ type: PUBLISHTX_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.publishTransaction(request, (error, publishTransactionResponse) => {
      if (error) {
        dispatch({ error, type: PUBLISHTX_FAILED });
      } else {
        dispatch({
          publishTransactionResponse: Buffer.from(publishTransactionResponse.getTransactionHash()),
          type: PUBLISHTX_SUCCESS
        });
      }
    });
  };
}

export const PURCHASETICKETS_ATTEMPT = "PURCHASETICKETS_ATTEMPT";
export const PURCHASETICKETS_FAILED = "PURCHASETICKETS_FAILED";
export const PURCHASETICKETS_SUCCESS = "PURCHASETICKETS_SUCCESS";

export function purchaseTicketsAttempt(
  passphrase,
  accountNum,
  spendLimit,
  requiredConf,
  numTickets,
  expiry,
  ticketFee,
  txFee,
  stakepool
) {
  return (dispatch, getState) => {
    wallet.log(
      "info",
      "Purchasing tickets",
      accountNum,
      spendLimit,
      requiredConf,
      numTickets,
      expiry,
      ticketFee,
      txFee,
      stakepool.TicketAddress,
      stakepool.PoolAddress,
      stakepool.PoolFees
    );
    const { currentBlockHeight } = getState().grpc;
    const request = new PurchaseTicketsRequest();
    request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
    request.setAccount(accountNum);
    request.setSpendLimit(spendLimit);
    request.setRequiredConfirmations(requiredConf);
    request.setTicketAddress(stakepool.TicketAddress);
    request.setNumTickets(numTickets);
    request.setPoolAddress(stakepool.PoolAddress);
    request.setPoolFees(stakepool.PoolFees);
    if (expiry !== 0) {
      request.setExpiry(currentBlockHeight + expiry);
    } else {
      request.setExpiry(expiry);
    }
    request.setTxFee(txFee * 1e8);
    request.setTicketFee(ticketFee * 1e8);
    dispatch({ type: PURCHASETICKETS_ATTEMPT });
    dispatch(
      importScriptAttempt(
        passphrase,
        stakepool.Script,
        false,
        0,
        stakepool.TicketAddress,
        error => {
          if (error) {
            dispatch({ error, type: PURCHASETICKETS_FAILED });
          } else {
            dispatch(purchaseTicketsAction(request));
          }
        }
      )
    );
  };
}

function purchaseTicketsAction(request) {
  return (dispatch, getState) => {
    const { walletService } = getState().grpc;
    walletService.purchaseTickets(request, (error, purchaseTicketsResponse) => {
      if (error) {
        dispatch({ error, type: PURCHASETICKETS_FAILED });
      } else {
        dispatch({
          purchaseTicketsResponse,
          type: PURCHASETICKETS_SUCCESS
        });
      }
    });
  };
}

export const REVOKETICKETS_ATTEMPT = "REVOKETICKETS_ATTEMPT";
export const REVOKETICKETS_FAILED = "REVOKETICKETS_FAILED";
export const REVOKETICKETS_SUCCESS = "REVOKETICKETS_SUCCESS";

export function revokeTicketsAttempt(passphrase) {
  const request = new RevokeTicketsRequest();
  request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
  return (dispatch, getState) => {
    dispatch({ type: REVOKETICKETS_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.revokeTickets(request, (error, revokeTicketsResponse) => {
      if (error) {
        dispatch({ error, type: REVOKETICKETS_FAILED });
      } else {
        dispatch({ revokeTicketsResponse, type: REVOKETICKETS_SUCCESS });
      }
    });
  };
}

export const GETTICKETBUYERCONFIG_ATTEMPT = "GETTICKETBUYERCONFIG_ATTEMPT";
export const GETTICKETBUYERCONFIG_FAILED = "GETTICKETBUYERCONFIG_FAILED";
export const GETTICKETBUYERCONFIG_SUCCESS = "GETTICKETBUYERCONFIG_SUCCESS";

export function getTicketBuyerConfigAttempt() {
  const request = new TicketBuyerConfigRequest();
  return (dispatch, getState) => {
    dispatch({ type: GETTICKETBUYERCONFIG_ATTEMPT });
    const { ticketBuyerService } = getState().grpc;
    ticketBuyerService.ticketBuyerConfig(request, (error, ticketBuyerConfig) => {
      if (error) {
        dispatch({ error, type: GETTICKETBUYERCONFIG_FAILED });
      } else {
        dispatch({ ticketBuyerConfig, type: GETTICKETBUYERCONFIG_SUCCESS });
      }
    });
  };
}

export const SETTICKETBUYERCONFIG_ATTEMPT = "SETTICKETBUYERCONFIG_ATTEMPT";
export const SETTICKETBUYERCONFIG_FAILED = "SETTICKETBUYERCONFIG_FAILED";
export const SETTICKETBUYERCONFIG_SUCCESS = "SETTICKETBUYERCONFIG_SUCCESS";
export const SETBALANCETOMAINTAIN = "SETBALANCETOMAINTAIN";
export const SETMAXFEE = "SETMAXFEE";
export const SETMAXPRICEABSOLUTE = "SETMAXPRICEABSOLUTE";
export const SETMAXPRICERELATIVE = "SETMAXPRICERELATIVE";
export const SETMAXPERBLOCK = "SETMAXPERBLOCK";

export function setTicketBuyerConfigAttempt(
  account,
  balanceToMaintain,
  maxFee,
  maxPriceAbsolute,
  maxPriceRelative,
  stakePool,
  maxPerBlock
) {
  return (dispatch, getState) => {
    const { walletName } = getState().daemon;
    const cfg = getWalletCfg(sel.isTestNet(getState()), walletName);
    dispatch({ type: SETTICKETBUYERCONFIG_ATTEMPT });
    const { ticketBuyerService } = getState().grpc;
    const { getTicketBuyerConfigResponse } = getState().control;
    let hitError = "";
    if (account !== getTicketBuyerConfigResponse.getAccount()) {
      const request = new SetAccountRequest();
      request.setAccount(account);
      ticketBuyerService.setAccount(request, error => {
        if (error) {
          hitError += `${error}. `;
        }
      });
    }
    if (balanceToMaintain * 1e8 !== getTicketBuyerConfigResponse.getBalanceToMaintain()) {
      const request = new SetBalanceToMaintainRequest();
      request.setBalanceToMaintain(balanceToMaintain * 1e8);
      ticketBuyerService.setBalanceToMaintain(request, error => {
        if (error) {
          hitError += `${error}. `;
        } else {
          cfg.set("balancetomaintain", balanceToMaintain);
          dispatch({ balanceToMaintain, type: SETBALANCETOMAINTAIN });
        }
      });
    }
    if (maxFee * 1e8 !== getTicketBuyerConfigResponse.getMaxFee()) {
      const request = new SetMaxFeeRequest();
      request.setMaxFeePerKb(maxFee * 1e8);
      ticketBuyerService.setMaxFee(request, error => {
        if (error) {
          hitError += `${error}. `;
        } else {
          cfg.set("maxfee", maxFee);
          dispatch({ maxFee, type: SETMAXFEE });
        }
      });
    }
    if (maxPriceAbsolute * 1e8 !== getTicketBuyerConfigResponse.getMaxPriceAbsolute()) {
      const request = new SetMaxPriceAbsoluteRequest();
      request.setMaxPriceAbsolute(maxPriceAbsolute * 1e8);
      ticketBuyerService.setMaxPriceAbsolute(request, error => {
        if (error) {
          hitError += `${error}. `;
        } else {
          cfg.set("maxpriceabsolute", maxPriceAbsolute);
          dispatch({ maxPriceAbsolute, type: SETMAXPRICEABSOLUTE });
        }
      });
    }
    if (maxPriceRelative !== getTicketBuyerConfigResponse.getMaxPriceRelative()) {
      const request = new SetMaxPriceRelativeRequest();
      request.setMaxPriceRelative(maxPriceRelative);
      ticketBuyerService.setMaxPriceRelative(request, error => {
        if (error) {
          hitError += `${error}. `;
        } else {
          cfg.set("maxpricerelative", maxPriceRelative);
          dispatch({ maxPriceRelative, type: SETMAXPRICERELATIVE });
        }
      });
    }
    if (stakePool.TicketAddress !== getTicketBuyerConfigResponse.getVotingAddress()) {
      const request = new SetVotingAddressRequest();
      request.setVotingAddress(stakePool.TicketAddress);
      ticketBuyerService.setVotingAddress(request, error => {
        if (error) {
          hitError += `${error}. `;
        }
      });
    }
    if (stakePool.PoolAddress !== getTicketBuyerConfigResponse.getPoolAddress()) {
      const request = new SetPoolAddressRequest();
      request.setPoolAddress(stakePool.PoolAddress);
      ticketBuyerService.setPoolAddress(request, error => {
        if (error) {
          hitError += `${error}. `;
        }
      });
    }
    if (stakePool.PoolFees !== getTicketBuyerConfigResponse.getPoolFees()) {
      const request = new SetPoolFeesRequest();
      request.setPoolFees(stakePool.PoolFees);
      ticketBuyerService.setPoolFees(request, error => {
        if (error) {
          hitError += `${error}. `;
        }
      });
    }
    if (maxPerBlock !== getTicketBuyerConfigResponse.getMaxPerBlock()) {
      const request = new SetMaxPerBlockRequest();
      request.setMaxPerBlock(maxPerBlock);
      ticketBuyerService.setMaxPerBlock(request, error => {
        if (error) {
          hitError += `${error}. `;
        } else {
          cfg.set("maxperblock", maxPerBlock);
          dispatch({ maxPerBlock, type: SETMAXPERBLOCK });
        }
      });
    }
    if (hitError !== "") {
      dispatch({ error: hitError, type: SETTICKETBUYERCONFIG_FAILED });
    } else {
      dispatch({
        success: "Ticket buyer settings have been successfully updated.",
        type: SETTICKETBUYERCONFIG_SUCCESS
      });
      dispatch(getTicketBuyerConfigAttempt());
    }
  };
}

export const STARTAUTOBUYER_ATTEMPT = "STARTAUTOBUYER_ATTEMPT";
export const STARTAUTOBUYER_FAILED = "STARTAUTOBUYER_FAILED";
export const STARTAUTOBUYER_SUCCESS = "STARTAUTOBUYER_SUCCESS";

export function startAutoBuyerAttempt(
  passphrase,
  accountNum,
  balanceToMaintain,
  maxFeePerKb,
  maxPriceRelative,
  maxPriceAbsolute,
  maxPerBlock,
  stakepool
) {
  const request = new StartAutoBuyerRequest();
  request.setPassphrase(new Uint8Array(Buffer.from(passphrase)));
  request.setAccount(accountNum);
  request.setBalanceToMaintain(balanceToMaintain * 1e8);
  request.setMaxFeePerKb(maxFeePerKb * 1e8);
  request.setMaxPriceRelative(maxPriceRelative);
  request.setMaxPriceAbsolute(maxPriceAbsolute * 1e8);
  request.setVotingAddress(stakepool.TicketAddress);
  request.setPoolAddress(stakepool.PoolAddress);
  request.setPoolFees(stakepool.PoolFees);
  request.setMaxPerBlock(maxPerBlock);
  return (dispatch, getState) => {
    dispatch({
      type: STARTAUTOBUYER_ATTEMPT
    });
    const { ticketBuyerService } = getState().grpc;
    ticketBuyerService.startAutoBuyer(request, (error, startAutoBuyerResponse) => {
      if (error) {
        dispatch({ error, type: STARTAUTOBUYER_FAILED });
      } else {
        const success = "You successfully started the auto ticket buyer.";
        dispatch({
          success,
          startAutoBuyerResponse,
          type: STARTAUTOBUYER_SUCCESS,
          balanceToMaintain,
          maxFeePerKb: maxFeePerKb * 1e8,
          maxPriceRelative,
          maxPriceAbsolute,
          maxPerBlock
        });
        setTimeout(() => dispatch(getTicketBuyerConfigAttempt(), 1000));
      }
    });
  };
}

export const STOPAUTOBUYER_ATTEMPT = "STOPAUTOBUYER_ATTEMPT";
export const STOPAUTOBUYER_FAILED = "STOPAUTOBUYER_FAILED";
export const STOPAUTOBUYER_SUCCESS = "STOPAUTOBUYER_SUCCESS";

export function stopAutoBuyerAttempt() {
  const request = new StopAutoBuyerRequest();
  return (dispatch, getState) => {
    dispatch({ type: STOPAUTOBUYER_ATTEMPT });
    const { ticketBuyerService } = getState().grpc;
    ticketBuyerService.stopAutoBuyer(request, (error, stopAutoBuyerResponse) => {
      if (error) {
        // The only error that can be returned here is if the autobuyer is not running when requested to stop.
        // We're currently issuing a stop auto buyer request on startup, so to avoid that error being shown,
        // it makes sense to just remove the error consumption altogether.
        dispatch({ type: STOPAUTOBUYER_FAILED });
      } else {
        const success = "You successfully stopped the auto ticket buyer.";
        dispatch({
          success,
          stopAutoBuyerResponse,
          type: STOPAUTOBUYER_SUCCESS
        });
      }
    });
  };
}

export const CONSTRUCTTX_ATTEMPT = "CONSTRUCTTX_ATTEMPT";
export const CONSTRUCTTX_FAILED = "CONSTRUCTTX_FAILED";
export const CONSTRUCTTX_SUCCESS = "CONSTRUCTTX_SUCCESS";

export function constructTransactionAttempt(account, confirmations, outputs, all) {
  const request = new ConstructTransactionRequest();
  request.setSourceAccount(parseInt(account));
  request.setRequiredConfirmations(parseInt(parseInt(confirmations)));
  let totalAmount = 0;
  if (!all) {
    request.setOutputSelectionAlgorithm(0);
    for (const output of outputs) {
      const outputDest = new ConstructTransactionRequest.OutputDestination();
      outputDest.setAddress(output.destination);
      const newOutput = new ConstructTransactionRequest.Output();
      newOutput.setDestination(outputDest);
      newOutput.setAmount(parseInt(output.amount));
      request.addNonChangeOutputs(newOutput);
      totalAmount += output.amount;
    }
  } else {
    if (outputs.length > 1) {
      return dispatch => {
        const error = "Too many outputs provided for a send all request.";
        dispatch({ error, type: CONSTRUCTTX_FAILED });
      };
    } else if (outputs.length === 0) {
      return dispatch => {
        const error = "No destination specified for send all request.";
        dispatch({ error, type: CONSTRUCTTX_FAILED });
      };
    }
    request.setOutputSelectionAlgorithm(1);
    const outputDest = new ConstructTransactionRequest.OutputDestination();
    outputDest.setAddress(outputs[0].data.destination);
    request.setChangeDestination(outputDest);
  }
  return (dispatch, getState) => {
    dispatch({ type: CONSTRUCTTX_ATTEMPT });
    const { walletService } = getState().grpc;
    walletService.constructTransaction(request, (error, constructTxResponse) => {
      if (error) {
        dispatch({ error, type: CONSTRUCTTX_FAILED });
      } else {
        if (!all) {
          constructTxResponse.totalAmount = totalAmount;
        } else {
          constructTxResponse.totalAmount = constructTxResponse.getTotalOutputAmount();
        }
        dispatch({ constructTxResponse, type: CONSTRUCTTX_SUCCESS });
      }
    });
  };
}

export const VALIDATEADDRESS_ATTEMPT = "VALIDATEADDRESS_ATTEMPT";
export const VALIDATEADDRESS_FAILED = "VALIDATEADDRESS_FAILED";
export const VALIDATEADDRESS_SUCCESS = "VALIDATEADDRESS_SUCCESS";
export const VALIDATEADDRESS_CLEANSTORE = "VALIDATEADDRESS_CLEANSTORE";

export const validateAddress = address => async (dispatch, getState) => {
  try {
    const { network } = getState().daemon;
    const validationErr = isValidAddress(address, network);
    if (validationErr) {
      dispatch({ type: VALIDATEADDRESS_FAILED });
      return {
        isValid: false,
        error: validationErr,
        getIsValid() {
          return false;
        }
      };
    }
    dispatch({ type: VALIDATEADDRESS_ATTEMPT });
    const response = await wallet.validateAddress(sel.walletService(getState()), address);
    dispatch({ response, type: VALIDATEADDRESS_SUCCESS });
    return {
      isValid: response.getIsValid(),
      error: null,
      getIsValid() {
        return response.getIsValid();
      }
    };
  } catch (error) {
    dispatch({ type: VALIDATEADDRESS_FAILED });
    return {
      isValid: false,
      error,
      getIsValid() {
        return false;
      }
    };
  }
};

export const validateAddressCleanStore = () => dispatch => {
  dispatch({ type: VALIDATEADDRESS_CLEANSTORE });
};

export const SIGNMESSAGE_ATTEMPT = "SIGNMESSAGE_ATTEMPT";
export const SIGNMESSAGE_FAILED = "SIGNMESSAGE_FAILED";
export const SIGNMESSAGE_SUCCESS = "SIGNMESSAGE_SUCCESS";
export const SIGNMESSAGE_CLEANSTORE = "SIGNMESSAGE_CLEANSTORE";

export function signMessageAttempt(address, message, passphrase) {
  return (dispatch, getState) => {
    dispatch({ type: SIGNMESSAGE_ATTEMPT });
    wallet
      .signMessage(sel.walletService(getState()), address, message, passphrase)
      .then(getSignMessageResponse =>
        dispatch({ getSignMessageResponse, type: SIGNMESSAGE_SUCCESS })
      )
      .catch(error => dispatch({ error, type: SIGNMESSAGE_FAILED }));
  };
}

export const signMessageCleanStore = () => ({ type: SIGNMESSAGE_CLEANSTORE });

export const VERIFYMESSAGE_ATTEMPT = "VERIFYMESSAGE_ATTEMPT";
export const VERIFYMESSAGE_FAILED = "VERIFYMESSAGE_FAILED";
export const VERIFYMESSAGE_SUCCESS = "VERIFYMESSAGE_SUCCESS";
export const VERIFYMESSAGE_CLEANSTORE = "VERIFYMESSAGE_CLEANSTORE";

export function verifyMessageAttempt(address, message, signature) {
  return (dispatch, getState) => {
    dispatch({ type: VERIFYMESSAGE_ATTEMPT });
    wallet
      .verifyMessage(sel.messageVerificationService(getState()), address, message, signature)
      .then(getVerifyMessageResponse => {
        dispatch({ getVerifyMessageResponse, type: VERIFYMESSAGE_SUCCESS });
      })
      .catch(error => dispatch({ error, type: VERIFYMESSAGE_FAILED }));
  };
}

export const verifyMessageCleanStore = () => ({ type: VERIFYMESSAGE_CLEANSTORE });

export const PUBLISHUNMINEDTRANSACTIONS_ATTEMPT = "PUBLISHUNMINEDTRANSACTIONS_ATTEMPT";
export const PUBLISHUNMINEDTRANSACTIONS_SUCCESS = "PUBLISHUNMINEDTRANSACTIONS_SUCCESS";
export const PUBLISHUNMINEDTRANSACTIONS_FAILED = "PUBLISHUNMINEDTRANSACTIONS_FAILED";

export const publishUnminedTransactionsAttempt = () => (dispatch, getState) => {
  dispatch({ type: PUBLISHUNMINEDTRANSACTIONS_ATTEMPT });

  wallet
    .publishUnminedTransactions(sel.walletService(getState()))
    .then(() => dispatch({ type: PUBLISHUNMINEDTRANSACTIONS_SUCCESS }))
    .catch(error => dispatch({ error, type: PUBLISHUNMINEDTRANSACTIONS_FAILED }));
};

export const MODAL_SHOWN = "MODAL_SHOWN";
export const MODAL_HIDDEN = "MODAL_HIDDEN";
export const modalShown = () => dispatch => dispatch({ type: MODAL_SHOWN });
export const modalHidden = () => dispatch => dispatch({ type: MODAL_HIDDEN });
