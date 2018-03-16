import { action, observable } from 'mobx';
import FOREIGN_ABI from '../abis/ForeignBridge.json';
import ERC677_ABI from '../abis/ERC677.json';
import Web3Utils from 'web3-utils';

class ForeignStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  @observable totalSupply = '';
  @observable symbol = '';
  @observable balance = '';
  foreignBridge = {};
  FOREIGN_BRIDGE_ADDRESS = process.env.REACT_APP_FOREIGN_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.web3Store = rootStore.web3Store;
    this.foreignWeb3 = rootStore.web3Store.foreignWeb3
    this.setForeign()
  }

  setForeign(){
    this.foreignBridge = new this.foreignWeb3.eth.Contract(FOREIGN_ABI, this.FOREIGN_BRIDGE_ADDRESS);
    this.getEvents()
    this.getTokenInfo()
    this.foreignBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
      this.getTokenInfo()
    })
  }

  @action
  async getTokenInfo(){
    const tokenAddress = await this.foreignBridge.methods.erc677token().call()
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
  }

  @action
  getEvents() {
    this.foreignBridge.getPastEvents({fromBlock: 0}, (e, foreignEvents) => {
      console.log('foreignEvents', foreignEvents)
      const events = []
      foreignEvents.forEach((event) => {
        events.push(event)
        if(event.event === "Deposit" || event.event === "Withdraw"){
        }
      })
      this.events = events;
    })
  }
}

export default ForeignStore;