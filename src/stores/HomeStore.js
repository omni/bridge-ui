import { action, observable } from 'mobx';
import HOME_ABI from '../abis/HomeBridge.json';
import Web3Utils from 'web3-utils'
import BN from 'bignumber.js';

class HomeStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  @observable errors = [];
  @observable balance = "";
  @observable filter = false;
  @observable maxCurrentDeposit = "";
  @observable maxPerTx = "";
  @observable latestBlockNumber = 0;
  filteredBlockNumber = 0
  homeBridge = {};
  HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.homeWeb3 = rootStore.web3Store.homeWeb3
    this.web3Store = rootStore.web3Store
    this.errorsStore = rootStore.errorsStore
    this.setHome()
  }

  async setHome(){
    this.homeBridge = new this.homeWeb3.eth.Contract(HOME_ABI, this.HOME_BRIDGE_ADDRESS);
    await this.getBlockNumber()
    this.getMinPerTxLimit()
    this.getMaxPerTxLimit()
    this.getEvents()
    this.getBalance()
    this.getCurrentLimit()
    setInterval(() => {
      this.getEvents()
      this.getBalance()
      this.web3Store.getBalances()
      this.getCurrentLimit()
      this.getBlockNumber()
    }, 5000)
  }

  @action
  async getBlockNumber() {
    try {
      this.latestBlockNumber = await this.homeWeb3.eth.getBlockNumber()
    } catch(e){
      console.error(e)
    }
  }
  
  @action
  async getMaxPerTxLimit(){
    try {
      const maxPerTx = await this.homeBridge.methods.maxPerTx().call()
      this.maxPerTx = Web3Utils.fromWei(maxPerTx);
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMinPerTxLimit(){
    try {
      const minPerTx = await this.homeBridge.methods.minPerTx().call()
      this.minPerTx = Web3Utils.fromWei(minPerTx);
    } catch(e){
      console.error(e)
    }
  }

  @action
  getBalance() {
    this.homeWeb3.eth.getBalance(this.HOME_BRIDGE_ADDRESS).then((balance) => {
      this.balance = Web3Utils.fromWei(balance)
    }).catch((e) => {
      console.error(e)
      this.errors.push(e)
    })
  }

  @action
  getEvents() {
    const blockNumber = this.filteredBlockNumber || this.latestBlockNumber - 50
    this.homeBridge.getPastEvents({fromBlock: blockNumber}, (e, homeEvents) => {
      console.log('homeEvents', homeEvents)
      const events = []
      if(homeEvents){
        homeEvents.forEach((event) => {
          if(event.event === "Deposit" || event.event === "Withdraw"){
            events.push(event)
          }
        })
        if(!this.filter){
          this.events = events;
        }
      } else {
        this.errorsStore.pushError({
            label: "Error",
            message: `Cannot establish connection to Home Network.\n
                     Please make sure you have set it up in env variables`,
            type: "error"
          })
      }
    })
  }
  @action
  filterByTxHashInReturnValues(transactionHash) {
    const match = this.events.filter((event, index, obj) => {
      return event.returnValues.transactionHash === transactionHash
    })
    this.events = match
  }
  @action
  filterByTxHash(transactionHash) {
    const match = this.events.filter((event, index, obj) => {
      return event.transactionHash === transactionHash
    })
    this.events = match
  }

  @action
  toggleFilter(){
    this.filter = !this.filter
    this.getEvents()
  }
  
  @action
  setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    this.getEvents()
  }

  @action
  async getCurrentLimit(){
    try {
      const currentDay = await this.homeBridge.methods.getCurrentDay().call()
      const homeDailyLimit = await this.homeBridge.methods.homeDailyLimit().call()
      const totalSpentPerDay = await this.homeBridge.methods.totalSpentPerDay(currentDay).call()
      const maxCurrentDeposit = new BN(homeDailyLimit).minus(new BN(totalSpentPerDay)).toString(10)
      this.maxCurrentDeposit = Web3Utils.fromWei(maxCurrentDeposit);
    } catch(e){
      console.error(e)
    }
  }
}

export default HomeStore;