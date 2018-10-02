import { action, observable } from 'mobx';
import { abi as ERC677_ABI } from '../contracts/ERC677BridgeToken.json';
import { getBlockNumber, getExplorerUrl } from './utils/web3'
import {
  getMaxPerTxLimit,
  getMinPerTxLimit,
  getCurrentLimit,
  getPastEvents,
  getTotalSupply,
  getBalanceOf,
  getErc677TokenAddress,
  getSymbol,
  getErc20TokenAddress
} from './utils/contract'
import { balanceLoaded, removePendingTransaction } from './utils/testUtils'
import { getBridgeABIs, BRIDGE_MODES } from './utils/bridgeMode'

class ForeignStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  @observable totalSupply = '';
  @observable symbol = '';
  @observable balance = '';
  @observable filter = false;
  @observable maxCurrentDeposit = '';
  @observable maxPerTx = '';
  @observable minPerTx = '';
  @observable latestBlockNumber = 0;
  @observable dailyLimit = 0
  @observable totalSpentPerDay = 0
  @observable tokenAddress = '';
  filteredBlockNumber = 0;
  foreignBridge = {};
  tokenContract = {}
  FOREIGN_BRIDGE_ADDRESS = process.env.REACT_APP_FOREIGN_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.web3Store = rootStore.web3Store;
    this.foreignWeb3 = rootStore.web3Store.foreignWeb3
    this.alertStore = rootStore.alertStore
    this.homeStore = rootStore.homeStore;
    this.rootStore = rootStore
    this.waitingForConfirmation = new Set()
    this.setForeign()
  }

  async setForeign(){
    if (!this.rootStore.bridgeModeInitialized) {
      setTimeout(() => this.setForeign(), 200)
      return
    }
    const { FOREIGN_ABI } = getBridgeABIs(this.rootStore.bridgeMode)
    this.foreignBridge = new this.foreignWeb3.eth.Contract(FOREIGN_ABI, this.FOREIGN_BRIDGE_ADDRESS);
    await this.getBlockNumber()
    await this.getTokenInfo()
    this.getMinPerTxLimit()
    this.getMaxPerTxLimit()
    this.getEvents()
    this.getTokenBalance()
    this.getCurrentLimit()
    setInterval(() => {
      this.getBlockNumber()
      this.getEvents()
      this.getTokenBalance()
      this.getCurrentLimit()
    }, 15000)
  }

  @action
  async getBlockNumber() {
    try {
      this.latestBlockNumber = await getBlockNumber(this.foreignWeb3)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMaxPerTxLimit(){
    try {
      this.maxPerTx = await getMaxPerTxLimit(this.foreignBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMinPerTxLimit(){
    try {
      this.minPerTx = await getMinPerTxLimit(this.foreignBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getTokenInfo(){
    try {
      this.tokenAddress = this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_ERC || this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE
        ? await getErc20TokenAddress(this.foreignBridge)
        : await getErc677TokenAddress(this.foreignBridge)
      this.tokenContract = new this.foreignWeb3.eth.Contract(ERC677_ABI, this.tokenAddress);
      this.symbol = await getSymbol(this.tokenContract)
    } catch(e) {
      console.error(e)
    }
  }

  @action
  async getTokenBalance(){
    try {
      this.totalSupply = await getTotalSupply(this.tokenContract)
      this.web3Store.getWeb3Promise.then(async () => {
        this.balance = await getBalanceOf(this.tokenContract, this.web3Store.defaultAccount.address)
        balanceLoaded()
      })
    } catch(e) {
      console.error(e)
    }
  }

  @action
  async getEvents(fromBlock, toBlock) {
    try {
      fromBlock = fromBlock || this.filteredBlockNumber || this.latestBlockNumber - 50
      toBlock =  toBlock || this.filteredBlockNumber || "latest"

      if(fromBlock < 0) {
        fromBlock = 0
      }

      let foreignEvents = await getPastEvents(this.foreignBridge, fromBlock, toBlock)

      if(!this.filter){
        this.events = foreignEvents;
      }

      if(this.waitingForConfirmation.size) {
        const confirmationEvents = foreignEvents.filter((event) => event.event === "RelayedMessage" && this.waitingForConfirmation.has(event.returnValues.transactionHash))
        confirmationEvents.forEach(async event => {
          const TxReceipt = await this.getTxReceipt(event.transactionHash)
          if(TxReceipt && TxReceipt.logs && TxReceipt.logs.length > 1 && this.waitingForConfirmation.size) {
            this.alertStore.setLoadingStepIndex(3)
            const urlExplorer = getExplorerUrl(this.web3Store.foreignNet.id) + 'tx/' + event.transactionHash
            setTimeout(() => {
                this.alertStore.pushSuccess(`Tokens received on Ethereum ${this.web3Store.foreignNet.name} on Tx
            <a href='${urlExplorer}' target='blank' style="overflow-wrap: break-word;word-wrap: break-word;"> 
            ${event.transactionHash}</a>`, this.alertStore.FOREIGN_TRANSFER_SUCCESS)}
              , 2000)
            this.waitingForConfirmation.delete(event.returnValues.transactionHash)
          }
        })

        if(confirmationEvents.length) {
          removePendingTransaction()
        }
      }

      return foreignEvents
    } catch(e) {
      this.alertStore.pushError(`Cannot establish connection to Foreign Network.\n
                 Please make sure you have set it up in env variables`, this.alertStore.FOREIGN_CONNECTION_ERROR)
    }
  }

  @action
  async getCurrentLimit(){
    try {
      const result = await getCurrentLimit(this.foreignBridge)
      this.maxCurrentDeposit = result.maxCurrentDeposit
      this.dailyLimit = result.dailyLimit
      this.totalSpentPerDay = result.totalSpentPerDay
    } catch(e){
      console.error(e)
    }
  }

  @action
  async filterByTxHashInReturnValues(transactionHash) {
    this.getTxAndRelatedEvents(transactionHash)
  }

  @action
  async filterByTxHash(transactionHash) {
    this.homeStore.filterByTxHashInReturnValues(transactionHash)
    await this.getTxAndRelatedEvents(transactionHash)
  }

  @action
  async getTxAndRelatedEvents(transactionHash) {
    try {
      const txReceipt = await this.getTxReceipt(transactionHash)
      const from = txReceipt.blockNumber - 20
      const to = txReceipt.blockNumber + 20
      const events = await this.getEvents(from, to);
      this.events = events.filter((event) => event.transactionHash === transactionHash || event.signedTxHash === transactionHash)
    } catch (e) {
      this.events = []
    }
  }

  @action
  async setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    this.events = await this.getEvents()
  }

  
  @action
  setFilter(value){
    this.filter = value
  }

  addWaitingForConfirmation(hash) {
    this.waitingForConfirmation.add(hash)
    this.setBlockFilter(0)
    this.homeStore.setBlockFilter(0)
  }

  getTxReceipt(hash) {
    return this.foreignWeb3.eth.getTransactionReceipt(hash)
  }

  getDailyQuotaCompleted() {
    return this.dailyLimit ? this.totalSpentPerDay / this.dailyLimit * 100 : 0
  }

}

export default ForeignStore;
