import { action, observable } from 'mobx';
import HOME_ABI from '../abis/HomeBridge.json';
import { getBlockNumber, getBalance } from './utils/web3'
import { getMaxPerTxLimit, getMinPerTxLimit, getCurrentLimit, getPastEvents } from './utils/contract'

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

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
    this.rootStore = rootStore
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
      this.latestBlockNumber = await getBlockNumber(this.homeWeb3)
    } catch(e){
      console.error(e)
    }
  }
  
  @action
  async getMaxPerTxLimit(){
    try {
      this.maxPerTx = await getMaxPerTxLimit(this.homeBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMinPerTxLimit(){
    try {
      this.minPerTx = await getMinPerTxLimit(this.homeBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getBalance() {
    try {
      this.balance = await getBalance(this.homeWeb3, this.HOME_BRIDGE_ADDRESS)
    } catch(e) {
      console.error(e)
      this.errors.push(e)
    }
  }

  @action
  async getEvents(fromBlock, toBlock) {
    try {
      fromBlock = fromBlock || this.filteredBlockNumber || this.latestBlockNumber - 50
      toBlock =  toBlock || this.filteredBlockNumber || "latest"
      let homeEvents = await getPastEvents(this.homeBridge, fromBlock, toBlock)
      homeEvents = homeEvents.filter((event) => event.event === "Deposit" || event.event === "Withdraw")
      if(!this.filter){
        this.events = homeEvents;
      }
      return homeEvents
    } catch(e) {
      this.errorsStore.pushError({
        label: "Error",
        message: `Cannot establish connection to Home Network.\n
                 Please make sure you have set it up in env variables`,
        type: "error"
      })
    }
  }
  @action
  async filterByTxHashInReturnValues(transactionHash) {
    console.log('filter home', transactionHash)
    const events = await this.getEvents(1,"latest");
    this.events = events.filter((event) => event.returnValues.transactionHash === transactionHash)
  }
  @action
  async filterByTxHash(transactionHash) {
    const events = await this.getEvents(1,"latest");
    const match = [];
    await asyncForEach(events, async (event) => {
      if(event.transactionHash === transactionHash){
        if(event.event === 'Withdraw'){
          await this.rootStore.foreignStore.filterByTxHash(event.returnValues.transactionHash)
        }
        match.push(event)
      }
    })
    this.events = match
  }

  @action
  toggleFilter(){
    this.filter = !this.filter
  }
  
  @action
  async setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    await this.getEvents()
  }

  @action
  async getCurrentLimit(){
    try {
      this.maxCurrentDeposit = await getCurrentLimit(this.homeBridge, true)
    } catch(e){
      console.error(e)
    }
  }
}

export default HomeStore;
