import { action, observable } from "mobx";
import getWeb3 from './utils/getWeb3';
import Web3 from 'web3';

const HOME_WEB_SOCKETS_PARITY_URL = process.env.REACT_APP_HOME_WEB_SOCKETS_PARITY_URL;
const FOREGIGN_WEB_SOCKETS_PARITY_URL = process.env.REACT_APP_FOREGIGN_WEB_SOCKETS_PARITY_URL;

class Web3Store {
  @observable injectedWeb3 = {};
  @observable defaultAccount = '';

  @observable homeWeb3 = {};
  @observable foreignWeb3 = {};

  @observable loading = true;
  @observable errors = [];

  getWeb3Promise = null;
  constructor(rootStore) {
    this.getWeb3Promise = getWeb3().then(async (web3Config) => {
      const {web3Instance, defaultAccount} = web3Config;
      this.defaultAccount = defaultAccount;
      this.injectedWeb3 = new Web3(web3Instance.currentProvider); 
      this.loading = false;
      console.log('web3 loaded')
    }).catch((e) => {
      console.error(e,'web3 not loaded')
      this.errors.push(e.message)
    })
    this.setWeb3Home();
    this.setWeb3Foreign();
  }

  setWeb3Home() {
    const homeWeb3Provider = new Web3.providers.WebsocketProvider(HOME_WEB_SOCKETS_PARITY_URL);
    this.homeWeb3 = new Web3(homeWeb3Provider);

  }
  setWeb3Foreign() {
    const foreignWeb3Provider = new Web3.providers.WebsocketProvider(FOREGIGN_WEB_SOCKETS_PARITY_URL);
    this.foreignWeb3 = new Web3(foreignWeb3Provider);
  }

}

export default Web3Store;