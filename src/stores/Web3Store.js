import { action, observable } from "mobx";
import getWeb3 from './utils/getWeb3';
import Web3 from 'web3';
import Web3Utils from 'web3-utils';

class Web3Store {
  @observable injectedWeb3 = {};
  @observable defaultAccount = {address: '', homeBalance: '', foreignBalance: ''};

  @observable homeWeb3 = {};
  @observable foreignWeb3 = {};

  @observable loading = true;
  @observable errors = [];

  getWeb3Promise = null;

  @observable homeNet = {id: '', name: ''};
  @observable foreignNet = {id: '', name: ''};
  @observable metamaskNet = {id: '', name: ''};

  HOME_HTTP_PARITY_URL = process.env.REACT_APP_HOME_HTTP_PARITY_URL;
  FOREIGN_HTTP_PARITY_URL = process.env.REACT_APP_FOREIGN_HTTP_PARITY_URL;

  constructor(rootStore) {
    this.errorsStore = rootStore.errorsStore;

    this.getWeb3Promise = getWeb3().then(async (web3Config) => {
      const {web3Instance, defaultAccount, netIdName, netId} = web3Config;
      this.metamaskNet = {id: netId, name: netIdName};
      this.defaultAccount.address = defaultAccount;
      this.injectedWeb3 = new Web3(web3Instance.currentProvider); 
      this.loading = false;
      this.getBalances(defaultAccount);
    }).catch((e) => {
      console.error(e,'web3 not loaded')
      this.errors.push(e.message)
    })
    this.setWeb3Home();
    this.setWeb3Foreign();
  }

  setWeb3Home() {
    const homeWeb3Provider = new Web3.providers.HttpProvider(this.HOME_HTTP_PARITY_URL);
    this.homeWeb3 = new Web3(homeWeb3Provider);
    this.setNetId({web3: this.homeWeb3, isHome: true});
  }

  setWeb3Foreign() {
    const foreignWeb3Provider = new Web3.providers.HttpProvider(this.FOREIGN_HTTP_PARITY_URL);
    this.foreignWeb3 = new Web3(foreignWeb3Provider);
    this.setNetId({web3: this.foreignWeb3, isHome: false});
  }
  async setNetId({web3, isHome}){
    try {
      let currentNet = isHome ? this.homeNet : this.foreignNet
      currentNet.id = await web3.eth.net.getId()
      switch (currentNet.id.toString()) {
        case "1":
          currentNet.name = 'Foundation'
          break;
        case "3":
          currentNet.name = 'Ropsten'
          break;
        case "4":
          currentNet.name = 'Rinkeby'
          break;
        case "42":
          currentNet.name = 'Kovan'
          break;
        case "99":
          currentNet.name = 'POA Core'
          break;
        case "77":
          currentNet.name = 'POA Sokol'
          break;
        default:
          currentNet.name = 'Unknown'
          break;
      }
    } catch(e) {
      console.error(e)
    }
  }
  @action
  async getBalances(){
    try {
      const homeBalance = await this.homeWeb3.eth.getBalance(this.defaultAccount.address)
      this.defaultAccount.homeBalance = Web3Utils.fromWei(homeBalance)
      const foreignBalance = await this.foreignWeb3.eth.getBalance(this.defaultAccount.address)
      this.defaultAccount.foreignBalance = Web3Utils.fromWei(foreignBalance)
    } catch(e){
      console.error(e)
      this.errorsStore.pushError(e)
    }
  }

}

export default Web3Store;