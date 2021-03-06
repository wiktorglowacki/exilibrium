import axios from "axios";
import * as wallet from "wallet";
import {
  getWalletServiceAttempt,
  getTicketBuyerServiceAttempt,
  getAgendaServiceAttempt,
  getVotingServiceAttempt
} from "./ClientActions";
import { getVersionServiceAttempt } from "./VersionActions";
import { getAvailableWallets, WALLETREMOVED_FAILED } from "./DaemonActions";
import { getWalletCfg, getGlobalCfg, getExccdCert } from "config";
import { getWalletPath } from "main_dev/paths";
import { isTestNet, explorer, apiAddress } from "selectors";

const MAX_RPC_RETRIES = 15;
const RPC_RETRY_DELAY = 15000;

export const versionCheckAction = () => dispatch =>
  setTimeout(() => dispatch(getVersionServiceAttempt()), 2000);

export const LOADER_ATTEMPT = "LOADER_ATTEMPT";
export const LOADER_FAILED = "LOADER_FAILED";
export const LOADER_SUCCESS = "LOADER_SUCCESS";

export const loaderRequest = () => (dispatch, getState) => {
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  const request = { isTestNet: isTestNet(getState()), walletName, address, port };
  dispatch({ request, type: LOADER_ATTEMPT });
  return wallet
    .getLoader(request)
    .then(loader => {
      dispatch({ loader, type: LOADER_SUCCESS });
      dispatch(walletExistRequest());
    })
    .catch(error => dispatch({ error, type: LOADER_FAILED }));
};

export const WALLETEXIST_ATTEMPT = "WALLETEXIST_ATTEMPT";
export const WALLETEXIST_FAILED = "WALLETEXIST_FAILED";
export const WALLETEXIST_SUCCESS = "WALLETEXIST_SUCCESS";

export const walletExistRequest = () => (dispatch, getState) =>
  wallet
    .getWalletExists(getState().walletLoader.loader)
    .then(response => {
      dispatch({ response, type: WALLETEXIST_SUCCESS });
      if (response.getExists()) {
        dispatch(openWalletAttempt("public", false));
      }
    })
    .catch(error => dispatch({ error, type: WALLETEXIST_FAILED }));

export const CREATEWALLET_NEWSEED_CONFIRM_INPUT = "CREATEWALLET_NEWSEED_CONFIRM_INPUT";
export const CREATEWALLET_NEWSEED_BACK_INPUT = "CREATEWALLET_NEWSEED_BACK_INPUT";
export const CREATEWALLET_EXISTINGSEED_INPUT = "CREATEWALLET_EXISTINGSEED_INPUT";
export const CREATEWALLET_GOBACK_EXISITNG_OR_NEW = "CREATEWALLET_GOBACK_EXISITNG_OR_NEW";
export const CREATEWALLET_GOBACK = "CREATEWALLET_GOBACK";
export const CREATEWALLET_NEWSEED_INPUT = "CREATEWALLET_NEWSEED_INPUT";
export const CREATEWALLET_IMPORTSEED_INPUT = "CREATEWALLET_IMPORTSEED_INPUT";

export const createWalletConfirmNewSeed = () => ({ type: CREATEWALLET_NEWSEED_CONFIRM_INPUT });
export const createWalletGoBackNewSeed = () => ({ type: CREATEWALLET_NEWSEED_BACK_INPUT });
export const createWalletGoBackExistingOrNew = () => ({
  type: CREATEWALLET_GOBACK_EXISITNG_OR_NEW
});

export const createWalletGoBackWalletSelection = () => (dispatch, getState) => {
  const {
    daemon: { walletName, network }
  } = getState();
  wallet.stopWallet().then(() => {
    wallet
      .removeWallet(walletName, network === "testnet")
      .then(() => {
        dispatch({ type: CREATEWALLET_GOBACK });
        dispatch(getAvailableWallets(false));
      })
      .catch(err => {
        console.error(err);
        dispatch({ error: err, type: WALLETREMOVED_FAILED });
      });
  });
};

export const createWalletExistingToggle = walletCreationType => dispatch => {
  switch (walletCreationType) {
    case "new":
      setTimeout(() => dispatch({ type: CREATEWALLET_NEWSEED_INPUT }), 50);
      return;
    case "restore":
      dispatch({ type: CREATEWALLET_EXISTINGSEED_INPUT });
      return;
    case "import":
      dispatch({ type: CREATEWALLET_IMPORTSEED_INPUT });
  }
};

export const CREATEWALLET_ATTEMPT = "CREATEWALLET_ATTEMPT";
export const CREATEWALLET_FAILED = "CREATEWALLET_FAILED";
export const CREATEWALLET_SUCCESS = "CREATEWALLET_SUCCESS";

export function createWalletRequest(pubPass, privPass, seed, existing) {
  return (dispatch, getState) => {
    dispatch({ existing, type: CREATEWALLET_ATTEMPT });
    const { walletLoader, daemon } = getState();
    return wallet
      .createWallet(walletLoader.loader, pubPass, privPass, seed)
      .then(() => {
        const config = getWalletCfg(isTestNet(getState()), daemon.walletName);
        config.delete("discoveraccounts");
        dispatch({ response: {}, type: CREATEWALLET_SUCCESS });
        dispatch(clearStakePoolConfigNewWallet());
        dispatch({ complete: !existing, type: UPDATEDISCOVERACCOUNTS });
        config.set("discoveraccounts", !existing);
      })
      .catch(error => dispatch({ error, type: CREATEWALLET_FAILED }));
  };
}
export const OPENWALLET_INPUT = "OPENWALLET_INPUT";
export const OPENWALLET_FAILED_INPUT = "OPENWALLET_FAILED_INPUT";
export const OPENWALLET_ATTEMPT = "OPENWALLET_ATTEMPT";
export const OPENWALLET_FAILED = "OPENWALLET_FAILED";
export const OPENWALLET_SUCCESS = "OPENWALLET_SUCCESS";

export const openWalletAttempt = (pubPass, retryAttempt) => (dispatch, getState) => {
  dispatch({ type: OPENWALLET_ATTEMPT });
  return wallet
    .openWallet(getState().walletLoader.loader, pubPass)
    .then(() => {
      dispatch({ type: OPENWALLET_SUCCESS });
    })
    .catch(error => {
      if (error.message.includes("wallet already loaded")) {
        dispatch({ response: {}, type: OPENWALLET_SUCCESS });
      } else if (
        error.message.includes("invalid passphrase") &&
        error.message.includes("public key")
      ) {
        if (retryAttempt) {
          dispatch({ error, type: OPENWALLET_FAILED_INPUT });
        } else {
          dispatch({ type: OPENWALLET_INPUT });
        }
      } else {
        dispatch({ error, type: OPENWALLET_FAILED });
      }
    });
};

export const CLOSEWALLET_ATTEMPT = "CLOSEWALLET_ATTEMPT";
export const CLOSEWALLET_FAILED = "CLOSEWALLET_FAILED";
export const CLOSEWALLET_SUCCESS = "CLOSEWALLET_SUCCESS";

export const closeWalletRequest = () => (dispatch, getState) => {
  dispatch({ type: CLOSEWALLET_ATTEMPT });
  return wallet
    .closeWallet(getState().walletLoader.loader)
    .then(() => dispatch({ type: CLOSEWALLET_SUCCESS }))
    .catch(error => dispatch({ error, type: CLOSEWALLET_FAILED }));
};

export const STARTRPC_ATTEMPT = "STARTRPC_ATTEMPT";
export const STARTRPC_FAILED = "STARTRPC_FAILED";
export const STARTRPC_SUCCESS = "STARTRPC_SUCCESS";
export const STARTRPC_RETRY = "STARTRPC_RETRY";

export const startRpcRequestFunc = isRetry => (dispatch, getState) => {
  const {
    daemon: { credentials, appData, walletName }
  } = getState();
  const cfg = getWalletCfg(isTestNet(getState()), walletName);
  let rpcuser, rpccertPath, rpcpass, daemonhost, rpcport;

  if (credentials) {
    rpcuser = credentials.rpc_user;
    rpccertPath = credentials.rpc_cert;
    rpcpass = credentials.rpc_password;
    daemonhost = credentials.rpc_host;
    rpcport = credentials.rpc_port;
  } else if (appData) {
    rpcuser = cfg.get("rpc_user");
    rpcpass = cfg.get("rpc_pass");
    rpccertPath = `${appData}/rpc.cert`;
    daemonhost = "127.0.0.1";
    rpcport = "9109";
  } else {
    rpcuser = cfg.get("rpc_user");
    rpcpass = cfg.get("rpc_pass");
    daemonhost = "127.0.0.1";
    rpcport = "9109";
  }

  const { loader } = getState().walletLoader;

  const cert = getExccdCert(rpccertPath);
  if (!isRetry) {
    dispatch({ type: STARTRPC_ATTEMPT });
  }
  return wallet
    .startRpc(loader, daemonhost, rpcport, rpcuser, rpcpass, cert)
    .then(() => {
      dispatch({ type: STARTRPC_SUCCESS });
      dispatch(subscribeBlockAttempt());
    })
    .catch(error => {
      if (error.message.includes("RPC client already created")) {
        dispatch({ type: STARTRPC_SUCCESS });
        dispatch(subscribeBlockAttempt());
      } else if (isRetry) {
        const { rpcRetryAttempts } = getState().walletLoader;
        if (rpcRetryAttempts < MAX_RPC_RETRIES) {
          dispatch({ rpcRetryAttempts: rpcRetryAttempts + 1, type: STARTRPC_RETRY });
          setTimeout(() => dispatch(startRpcRequestFunc(isRetry)), RPC_RETRY_DELAY);
        } else {
          dispatch({
            error: `${error}.  You may need to edit ${getWalletPath(
              isTestNet(getState()),
              walletName
            )} and try again`,
            type: STARTRPC_FAILED
          });
        }
      } else {
        dispatch(startRpcRequestFunc(true));
      }
    });
};

export const EXPLORER_DATA_SUCCESS = "EXPLORER_DATA_SUCCESS";
export const EXPLORER_DATA_FAIL = "EXPLORER_DATA_FAIL";

export const fetchExplorerData = () => async (dispatch, getState) => {
  const state = getState();
  const globalConfig = getGlobalCfg();
  try {
    const { address: apiAddress } = state.api;
    const { data: explorerData } = await axios.get(`${apiAddress}/explorer.json`);
    if (explorerData) {
      globalConfig.set(`explorer.${globalConfig.get("network")}`, explorerData);
      dispatch({ type: EXPLORER_DATA_SUCCESS, explorerData });
    } else {
      throw new Error("Got empty response from API");
    }
  } catch (error) {
    wallet.log("error", `Cannot fetch explorer data: ${error}`);
    const savedExplorerData = globalConfig.get(`explorer.${globalConfig.get("network")}`);
    if (savedExplorerData) {
      dispatch({ type: EXPLORER_DATA_SUCCESS, savedExplorerData });
    } else {
      dispatch({ type: EXPLORER_DATA_FAIL, error });
    }
  }
};

export const DISCOVERADDRESS_INPUT = "DISCOVERADDRESS_INPUT";
export const DISCOVERADDRESS_FAILED_INPUT = "DISCOVERADDRESS_FAILED_INPUT";
export const DISCOVERADDRESS_ATTEMPT = "DISCOVERADDRESS_ATTEMPT";
export const DISCOVERADDRESS_FAILED = "DISCOVERADDRESS_FAILED";
export const DISCOVERADDRESS_SUCCESS = "DISCOVERADDRESS_SUCCESS";

export const discoverAddressAttempt = privPass => (dispatch, getState) => {
  const {
    walletLoader: { loader, discoverAccountsComplete }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  dispatch({ type: DISCOVERADDRESS_ATTEMPT });
  wallet
    .discoverAddresses(loader, !discoverAccountsComplete, privPass)
    .then(() => {
      const { subscribeBlockNtfnsResponse } = getState().walletLoader;

      if (!discoverAccountsComplete) {
        const config = getWalletCfg(isTestNet(getState()), walletName);
        config.delete("discoveraccounts");
        config.set("discoveraccounts", true);
        dispatch({ complete: true, type: UPDATEDISCOVERACCOUNTS });
      }

      dispatch({ response: {}, type: DISCOVERADDRESS_SUCCESS });
      if (subscribeBlockNtfnsResponse !== null) {
        dispatch(fetchHeadersAttempt());
      }
    })
    .catch(error => {
      if (error.message.includes("invalid passphrase") && error.message.includes("private key")) {
        dispatch({ error, type: DISCOVERADDRESS_FAILED_INPUT });
      } else {
        dispatch({ error, type: DISCOVERADDRESS_FAILED });
      }
    });
};

export const SUBSCRIBEBLOCKNTFNS_ATTEMPT = "SUBSCRIBEBLOCKNTFNS_ATTEMPT";
export const SUBSCRIBEBLOCKNTFNS_FAILED = "SUBSCRIBEBLOCKNTFNS_FAILED";
export const SUBSCRIBEBLOCKNTFNS_SUCCESS = "SUBSCRIBEBLOCKNTFNS_SUCCESS";

const subscribeBlockAttempt = () => (dispatch, getState) => {
  const { loader, discoverAccountsComplete } = getState().walletLoader;

  dispatch({ request: {}, type: SUBSCRIBEBLOCKNTFNS_ATTEMPT });
  return wallet
    .subscribeToBlockNotifications(loader)
    .then(() => {
      dispatch({ response: {}, type: SUBSCRIBEBLOCKNTFNS_SUCCESS });
      if (discoverAccountsComplete) {
        dispatch(discoverAddressAttempt());
      } else {
        // This is dispatched to indicate we should wait for user input to discover addresses.
        dispatch({ response: {}, type: DISCOVERADDRESS_INPUT });
      }
    })
    .catch(error => dispatch({ error, type: SUBSCRIBEBLOCKNTFNS_FAILED }));
};

export const FETCHHEADERS_ATTEMPT = "FETCHHEADERS_ATTEMPT";
export const FETCHHEADERS_FAILED = "FETCHHEADERS_FAILED";
export const FETCHHEADERS_SUCCESS = "FETCHHEADERS_SUCCESS";
export const FETCHHEADERS_PROGRESS = "FETCHHEADERS_PROGRESS";

export const fetchHeadersAttempt = () => (dispatch, getState) => {
  dispatch({ request: {}, type: FETCHHEADERS_ATTEMPT });
  return wallet
    .fetchHeaders(getState().walletLoader.loader)
    .then(response => {
      dispatch({ response, type: FETCHHEADERS_SUCCESS });
      dispatch(getWalletServiceAttempt());
      dispatch(getTicketBuyerServiceAttempt());
      dispatch(getVotingServiceAttempt());
      dispatch(getAgendaServiceAttempt());
    })
    .catch(error => dispatch({ error, type: FETCHHEADERS_FAILED }));
};

export const UPDATEDISCOVERACCOUNTS = "UPDATEDISCOVERACCOUNTS";
export const CLEARSTAKEPOOLCONFIG = "CLEARSTAKEPOOLCONFIG";

export function clearStakePoolConfigNewWallet() {
  return (dispatch, getState) => {
    const state = getState();
    const { walletName, network } = state.daemon;
    const testnet = isTestNet(state);
    const config = getWalletCfg(testnet, walletName);
    config.delete("stakepools");

    wallet.getStakePoolInfo(apiAddress(state), network).then(foundStakePoolConfigs => {
      if (foundStakePoolConfigs) {
        const config = getWalletCfg(isTestNet(getState()), walletName);
        config.set("stakepools", foundStakePoolConfigs);
        dispatch({ currentStakePoolConfig: foundStakePoolConfigs, type: CLEARSTAKEPOOLCONFIG });
      }
    });
  };
}

export const NEEDED_BLOCKS_DETERMINED = "NEEDED_BLOCKS_DETERMINED";
export function determineNeededBlocks() {
  return async (dispatch, getState) => {
    const { address, slugs } = explorer(getState());
    try {
      const response = await axios.get(`${address}/${slugs.status}`, {
        timeout: 15000
      });
      const { db_height: neededBlocks } = response.data;
      if (neededBlocks) {
        wallet.log("info", `Determined needed block height as ${neededBlocks}.`);
        dispatch({ neededBlocks, type: NEEDED_BLOCKS_DETERMINED });
      } else {
        throw new Error("Incompatible API response.");
      }
    } catch (error) {
      wallet.log("error", `Unable to obtain latest block number: ${error}`);
      const { credentials } = getState().daemon;
      const neededBlocks = await wallet.getBlockCount(credentials, isTestNet(getState()));
      if (neededBlocks) {
        wallet.log("info", `Determined needed block height from exccd as ${neededBlocks}.`);
        dispatch({ neededBlocks, type: NEEDED_BLOCKS_DETERMINED });
      }
    }
  };
}
