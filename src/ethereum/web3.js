import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "f2294ddd7f4943ada4964d67f686884d"
    }
  }
};

export const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions
});
