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
  filteredBlockNumber = 0;
  foreignBridge = {};
  FOREIGN_BRIDGE_ADDRESS = process.env.REACT_APP_FOREIGN_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.web3Store = rootStore.web3Store;
    this.foreignWeb3 = rootStore.web3Store.foreignWeb3
    this.errorsStore = rootStore.errorsStore
    this.setForeign()
  }

  setForeign(){
    this.foreignBridge = new this.foreignWeb3.eth.Contract(FOREIGN_ABI, this.FOREIGN_BRIDGE_ADDRESS);
    this.getMaxPerTxLimit()
    this.getEvents()
    this.getTokenInfo()
    this.getCurrentLimit()
    this.foreignBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
      this.getTokenInfo()
      this.getCurrentLimit()
    })
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
  async getTokenInfo(){
    try {
      const tokenAddress = await this.foreignBridge.methods.erc677token().call()
      console.log('tokenAddress', tokenAddress)
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
  getEvents() {
    this.foreignBridge.getPastEvents({fromBlock: this.filteredBlockNumber}, async (e, foreignEvents) => {
      console.log('foreignEvents', foreignEvents)
      let events = []
      if(foreignEvents) {
        await asyncForEach(foreignEvents, async (event) => {
          if(event.event === "SignedForWithdraw" || event.event === "CollectedSignatures") {
            const signedTxHash = await this.getSignedTx(event.returnValues.messageHash)
            event.signedTxHash = signedTxHash
          }
          events.push(event)
        })
        if(!this.filter){
          this.events = events;
        }
      } else {
        this.errorsStore.pushError({
          label: "Error",
          message: `Cannot establish connection to Foreign Network.\n
                  Please make sure you have set it up in env variables`,
          type: "error"
        })
      }
    })
    
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
  filterByTxHashInReturnValues(transactionHash) {
    const match = this.events.filter((event, index, obj) => {
      return event.returnValues.transactionHash === transactionHash
    })
    this.events = match
  }

  @action
  filterByTxHash(transactionHash) {
    const match = this.events.filter((event, index, obj) => {
      if(event.signedTxHash){
        return event.signedTxHash === transactionHash  
      }
      return event.transactionHash === transactionHash
    })
    this.events = match
  }

  @action
  setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    this.getEvents()
  }

  
  @action
  toggleFilter(){
    this.filter = !this.filter
    this.getEvents()
  }
}

export default ForeignStore;