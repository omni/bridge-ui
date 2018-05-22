import { action, observable } from 'mobx';
import HOME_ABI from '../abis/HomeBridge.json';
import BRIDGE_VALIDATORS_ABI from '../abis/BridgeValidators.json'
import { getBlockNumber, getBalance, getExplorerUrl } from './utils/web3'
import { getMaxPerTxLimit, getMinPerTxLimit, getCurrentLimit, getPastEvents } from './utils/contract'
import { removePendingTransaction } from './utils/testUtils'
import Web3Utils from 'web3-utils'
import BN from 'bignumber.js'

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
  @observable validators = []
  @observable homeBridgeValidators = ''
  @observable requiredSignatures = 0
  @observable dailyLimit = 0
  @observable totalSpentPerDay = 0
  @observable statistics = {
    deposits: 0,
    depositsValue: BN(0),
    withdraws: 0,
    withdrawsValue: BN(0),
    totalBridged: BN(0),
    users: new Set(),
    finished: false
  }
  filteredBlockNumber = 0
  homeBridge = {};
  HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.homeWeb3 = rootStore.web3Store.homeWeb3
    this.web3Store = rootStore.web3Store
    this.alertStore = rootStore.alertStore
    this.rootStore = rootStore
    this.waitingForConfirmation = new Set()
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
    this.getValidators()
    this.getStatistics()
    setInterval(() => {
      this.getEvents()
      this.getBalance()
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

      if(this.waitingForConfirmation.size) {
        const confirmationEvents = homeEvents.filter((event) => event.event === "Withdraw" && this.waitingForConfirmation.has(event.returnValues.transactionHash))
        confirmationEvents.forEach(event => {
          this.alertStore.setLoadingStepIndex(3)
          const urlExplorer = getExplorerUrl(this.web3Store.homeNet.id) + 'tx/' + event.transactionHash
          setTimeout(() => {
            this.alertStore.pushSuccess(`Tokens received on POA ${this.web3Store.homeNet.name} on Tx 
              <a href='${urlExplorer}' target='blank' style="overflow-wrap: break-word;word-wrap: break-word;">
              ${event.transactionHash}</a>`, this.alertStore.HOME_TRANSFER_SUCCESS)}
            , 2000)
          this.waitingForConfirmation.delete(event.returnValues.transactionHash)
        })

        if(confirmationEvents.length) {
          removePendingTransaction()
        }
      }

      return homeEvents
    } catch(e) {
      this.alertStore.pushError(`Cannot establish connection to Home Network.\n
                 Please make sure you have set it up in env variables`, this.alertStore.HOME_CONNECTION_ERROR)
    }
  }
  @action
  async filterByTxHashInReturnValues(transactionHash) {
    const events = await this.getEvents(1,"latest");
    this.events = events.filter((event) => event.returnValues.transactionHash === transactionHash)
  }
  @action
  async filterByTxHash(transactionHash) {
    const events = await this.getEvents(1,"latest");
    this.events = events.filter((event) => event.transactionHash === transactionHash)
    if(this.events.length > 0 && this.events[0].returnValues && this.events[0].returnValues.transactionHash) {
      await this.rootStore.foreignStore.filterByTxHashInReturnValues(this.events[0].returnValues.transactionHash)
    }
  }

  @action
  setFilter(value){
    this.filter = value
  }
  
  @action
  async setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    this.events = await this.getEvents()
  }

  @action
  async getCurrentLimit(){
    try {
      const result = await getCurrentLimit(this.homeBridge, true)
      this.maxCurrentDeposit = result.maxCurrentDeposit
      this.dailyLimit = result.dailyLimit
      this.totalSpentPerDay = result.totalSpentPerDay
    } catch(e){
      console.error(e)
    }
  }

  addWaitingForConfirmation(hash) {
    this.waitingForConfirmation.add(hash)
    this.setBlockFilter(0)
    this.rootStore.foreignStore.setBlockFilter(0)
  }

  @action
  async getValidators(){
    try {
      const homeValidatorsAddress = await this.homeBridge.methods.validatorContract().call()
      this.homeBridgeValidators = new this.homeWeb3.eth.Contract(BRIDGE_VALIDATORS_ABI, homeValidatorsAddress);

      let ValidatorAdded = await this.homeBridgeValidators.getPastEvents('ValidatorAdded', {fromBlock: 0});
      let ValidatorRemoved = await this.homeBridgeValidators.getPastEvents('ValidatorRemoved', {fromBlock: 0});
      let homeAddedValidators = ValidatorAdded.map(val => {
        return val.returnValues.validator
      })
      const homeRemovedValidators = ValidatorRemoved.map(val => {
        return val.returnValues.validator
      })
      this.validators =  homeAddedValidators.filter(val => !homeRemovedValidators.includes(val));
      this.requiredSignatures = await this.homeBridgeValidators.methods.requiredSignatures().call()
    } catch(e){
      console.error(e)
    }
  }


  async getStatistics() {
    try {
      const events = await getPastEvents(this.homeBridge, 0, 'latest')
      this.processLargeArrayAsync(events, this.processEvent)
    } catch(e){
      console.error(e)
    }
  }

  processEvent = (event) => {
    this.statistics.users.add(event.returnValues.recipient)
    if(event.event === "Deposit") {
      this.statistics.deposits++
      this.statistics.depositsValue = this.statistics.depositsValue.plus(BN(Web3Utils.fromWei(event.returnValues.value)))
    } else if (event.event === "Withdraw") {
      this.statistics.withdraws++
      this.statistics.withdrawsValue = this.statistics.withdrawsValue.plus(BN(Web3Utils.fromWei(event.returnValues.value)))
    }
  }

  processLargeArrayAsync(array, fn, maxTimePerChunk) {
    maxTimePerChunk = maxTimePerChunk || 16;
    let index = 0;

    function now() {
      return new Date().getTime();
    }

    const doChunk = () => {
      const startTime = now();
      while (index < array.length && (now() - startTime) <= maxTimePerChunk) {
        // callback called with args (value, index, array)
        fn.call(null, array[index], index, array);
        ++index;
      }
      if (index < array.length) {
        setTimeout(doChunk, 0);
      } else {
        this.statistics.finished = true
        this.statistics.totalBridged = this.statistics.depositsValue.plus(this.statistics.withdrawsValue)
      }
    }
    doChunk();
  }

  getDailyQuotaCompleted() {
    return this.dailyLimit ? this.totalSpentPerDay / this.dailyLimit * 100 : 0
  }

}

export default HomeStore;
