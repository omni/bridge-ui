import { action, observable } from "mobx";
import getWeb3, { getBalance, getWeb3Instance, getNetwork } from './utils/web3';
import { balanceLoaded } from './utils/testUtils'

class Web3Store {
  @observable injectedWeb3 = {};
  @observable defaultAccount = {address: '', homeBalance: '', foreignBalance: ''};

  @observable homeWeb3 = {};
  @observable foreignWeb3 = {};

  @observable loading = true;
  @observable errors = [];

  @observable getWeb3Promise = null;

  @observable homeNet = {id: '', name: ''};
  @observable foreignNet = {id: '', name: ''};
  @observable metamaskNet = {id: '', name: ''};

  HOME_HTTP_PARITY_URL = process.env.REACT_APP_HOME_HTTP_PARITY_URL;
  FOREIGN_HTTP_PARITY_URL = process.env.REACT_APP_FOREIGN_HTTP_PARITY_URL;

  constructor(rootStore) {
    this.alertStore = rootStore.alertStore;

    this.getWeb3Promise = getWeb3().then((web3Config) => {
      this.setWeb3State(web3Config)
      this.getBalances();
    }).catch((e) => {
      console.error(e,'web3 not loaded')
      this.errors.push(e.message)
    })
    this.setWeb3Home();
    this.setWeb3Foreign();
  }

  @action
  setWeb3State(web3Config) {
    const {web3Instance, defaultAccount, netIdName, netId} = web3Config;
    this.metamaskNet = {id: netId, name: netIdName};
    this.defaultAccount.address = defaultAccount;
    this.injectedWeb3 = web3Instance;
    this.loading = false;
  }

  @action
  async setWeb3Home() {
    this.homeWeb3 = getWeb3Instance(this.HOME_HTTP_PARITY_URL)
    this.homeNet = await getNetwork(this.homeWeb3)
  }

  @action
  async setWeb3Foreign() {
    this.foreignWeb3 = getWeb3Instance(this.FOREIGN_HTTP_PARITY_URL)
    this.foreignNet = await getNetwork(this.foreignWeb3)
  }

  @action
  async getBalances(){
    try {
      const accounts = await this.injectedWeb3.eth.getAccounts()
      if(accounts[0] !== this.defaultAccount.address) {
        this.defaultAccount.address = accounts[0]
      }
      this.defaultAccount.homeBalance = await getBalance(this.homeWeb3, this.defaultAccount.address)
      this.defaultAccount.foreignBalance = await getBalance(this.foreignWeb3, this.defaultAccount.address)
      balanceLoaded()
    } catch(e){
      this.alertStore.pushError(e)
    }
  }

}

export default Web3Store;
