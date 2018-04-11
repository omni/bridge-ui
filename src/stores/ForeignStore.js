import { action, observable } from 'mobx';
import FOREIGN_ABI from '../abis/ForeignBridge.json';
import ERC677_ABI from '../abis/ERC677.json';
import Web3Utils from 'web3-utils';
import BN from 'bignumber.js'

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

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
  @observable tokenAddress = '';
  filteredBlockNumber = 0;
  foreignBridge = {};
  FOREIGN_BRIDGE_ADDRESS = process.env.REACT_APP_FOREIGN_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.web3Store = rootStore.web3Store;
    this.foreignWeb3 = rootStore.web3Store.foreignWeb3
    this.errorsStore = rootStore.errorsStore
    this.homeStore = rootStore.homeStore;
    this.setForeign()
  }

  async setForeign(){
    this.foreignBridge = new this.foreignWeb3.eth.Contract(FOREIGN_ABI, this.FOREIGN_BRIDGE_ADDRESS);
    await this.getBlockNumber()
    this.getMinPerTxLimit()
    this.getMaxPerTxLimit()
    this.getEvents()
    this.getTokenInfo()
    this.getCurrentLimit()
    setInterval(() => {
      this.getBlockNumber()
      this.getEvents()
      this.getTokenInfo()
      this.getCurrentLimit()
    }, 15000)
  }

  @action
  async getBlockNumber() {
    try {
      this.latestBlockNumber = await this.foreignWeb3.eth.getBlockNumber()
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMaxPerTxLimit(){
    try {
      const maxPerTx = await this.foreignBridge.methods.maxPerTx().call()
      this.maxPerTx = Web3Utils.fromWei(maxPerTx);
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMinPerTxLimit(){
    try {
      const minPerTx = await this.foreignBridge.methods.minPerTx().call()
      this.minPerTx = Web3Utils.fromWei(minPerTx);
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getTokenInfo(){
    try {
      const tokenAddress = await this.foreignBridge.methods.erc677token().call()
      this.tokenAddress = tokenAddress;
      const tokenContract = new this.foreignWeb3.eth.Contract(ERC677_ABI, tokenAddress);
      const totalSupply = await tokenContract.methods.totalSupply().call()
      this.symbol = await tokenContract.methods.symbol().call()
      this.totalSupply = Web3Utils.fromWei(totalSupply)
      this.web3Store.getWeb3Promise.then(async () => {
        if(this.web3Store.defaultAccount.address && this.web3Store.metamaskNet.name === this.web3Store.foreignNet.name){
          const balance = await tokenContract.methods.balanceOf(this.web3Store.defaultAccount.address).call()
          this.balance = Web3Utils.fromWei(balance)
        } else {
          this.balance = `Please point metamask to ${this.web3Store.foreignNet.name}\n`
        }
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
      let foreignEvents = await this.foreignBridge.getPastEvents({fromBlock, toBlock});
      let events = []
      await asyncForEach(foreignEvents, (async (event, index) => {
        if(event.event === "SignedForWithdraw" || event.event === "CollectedSignatures") {
          const signedTxHash = await this.getSignedTx(event.returnValues.messageHash)
          event.signedTxHash = signedTxHash
        }
        events.push(event)
      }))
      if(!this.filter){
        this.events = events;
      }
      return events
    } catch(e) {
      this.errorsStore.pushError({
        label: "Error",
        message: `Cannot establish connection to Home Network.\n
                 Please make sure you have set it up in env variables`,
        type: "error"
      })
    }
  }
  async getSignedTx(messageHash){
    try {
        const message = await this.foreignBridge.methods.message(messageHash).call()
        return "0x" + message.substring(106, 170);
    } catch(e){
      console.error(e)
    }
  }
  @action
  async getCurrentLimit(){
    try {
      const currentDay = await this.foreignBridge.methods.getCurrentDay().call()
      const foreignDailyLimit = await this.foreignBridge.methods.foreignDailyLimit().call()
      const totalSpentPerDay = await this.foreignBridge.methods.totalSpentPerDay(currentDay).call()
      const maxCurrentDeposit = new BN(foreignDailyLimit).minus(new BN(totalSpentPerDay)).toString(10)
      this.maxCurrentDeposit = Web3Utils.fromWei(maxCurrentDeposit);
    } catch(e){
      console.error(e)
    }
  }

  @action
  async filterByTxHashInReturnValues(transactionHash) {
    const events = await this.getEvents(1,"latest");
    const match = events.filter((event, index, obj) => {
      return event.returnValues.transactionHash === transactionHash
    })
    this.events = match
  }

  @action
  async filterByTxHash(transactionHash) {
    this.homeStore.filterByTxHashInReturnValues(transactionHash)
    const events = await this.getEvents(1,"latest");
    const match = events.filter((event, index, obj) => {
      if(event.signedTxHash){
        return event.signedTxHash === transactionHash  
      }
      return event.transactionHash === transactionHash
    })
    console.log('events', match, transactionHash)
    this.events = match
  }

  @action
  async setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    await this.getEvents()
  }

  
  @action
  toggleFilter(){
    this.filter = !this.filter
  }
}

export default ForeignStore;