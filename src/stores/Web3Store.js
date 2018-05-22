import { action, observable } from "mobx";
import getWeb3, { getBalance, getWeb3Instance, getNetwork } from './utils/web3';
import { balanceLoaded } from './utils/testUtils'
import swal from 'sweetalert'

class Web3Store {
  @observable injectedWeb3 = {};
  @observable defaultAccount = {address: '', homeBalance: '', foreignBalance: ''};

  @observable homeWeb3 = {};
  @observable foreignWeb3 = {};

  @observable loading = true;
  @observable errors = [];

  @observable getWeb3Promise = null;
  @observable metamaskNotSetted = false;

  @observable homeNet = {id: '', name: ''};
  @observable foreignNet = {id: '', name: ''};
  @observable metamaskNet = {id: '', name: ''};

  HOME_HTTP_PARITY_URL = process.env.REACT_APP_HOME_HTTP_PARITY_URL;
  FOREIGN_HTTP_PARITY_URL = process.env.REACT_APP_FOREIGN_HTTP_PARITY_URL;

  constructor(rootStore) {
    this.alertStore = rootStore.alertStore;
    this.rootStore = rootStore

    this.getWeb3Promise = getWeb3().then((web3Config) => {
      this.setWeb3State(web3Config)
      this.getBalances(false)
      setInterval(() => {
        this.getBalances(true)
      }, 1000)
    }).catch((e) => {
      console.error(e,'web3 not loaded')
      this.errors.push(e.message)
      this.metamaskNotSetted = true
      this.showInstallMetamaskAlert()
    })
    this.setWeb3Home()
    this.setWeb3Foreign()
    this.checkMetamaskConfig()
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
  async getBalances(displayLoading){
    try {
      const accounts = await this.injectedWeb3.eth.getAccounts()
      const Loading = this.alertStore.showLoading
      let accountUpdated = false
      if(accounts[0] !== this.defaultAccount.address) {
        if(displayLoading && !Loading && accounts[0] !== undefined) {
          this.alertStore.setLoading(true)
          accountUpdated = true
        }
        this.defaultAccount.address = accounts[0]
      }
      this.defaultAccount.homeBalance = await getBalance(this.homeWeb3, this.defaultAccount.address)
      this.defaultAccount.foreignBalance = await getBalance(this.foreignWeb3, this.defaultAccount.address)
      if(accountUpdated) {
        await this.rootStore.foreignStore.getTokenBalance()
        this.alertStore.setLoading(false)
      }
      balanceLoaded()
    } catch(e){
      console.error(e)
    }
  }

  @action
  checkMetamaskConfig() {
    if(!this.metamaskNotSetted) {
      if(this.metamaskNet.name === '' || this.homeNet.name === '' || this.foreignNet.name === '') {
        setTimeout(() => {this.checkMetamaskConfig()}, 1000)
        return
      }
      if(this.metamaskNet.name !== this.homeNet.name && this.metamaskNet.name !== this.foreignNet.name) {
        this.metamaskNotSetted = true
        this.alertStore.pushError(`You are on an unknown network on metamask. Please select POA ${this.homeNet.name} or ETH ${this.foreignNet.name} in order to communicate with the bridge.`)
      }
    }
  }

  showInstallMetamaskAlert() {
    const errorNode = document.createElement("div")
    errorNode.innerHTML = "You need to install metamask and select an account. Please follow the instructions on the POA Network <a href='https://github.com/poanetwork/wiki/wiki/POA-Network-on-MetaMask' target='blank'>wiki</a> and reload the page."
    swal({
      title: "Error",
      content: errorNode,
      icon: "error",
      type: "error"
    });
  }

}

export default Web3Store;
