import { action, observable } from 'mobx';
import HOME_ABI from '../abis/HomeBridge.json';
import Web3Utils from 'web3-utils'
class HomeStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  @observable errors = [];
  @observable balance = "";
  homeBridge = {};
  HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;

  constructor (rootStore) {
    this.homeWeb3 = rootStore.web3Store.homeWeb3
    this.setHome()
  }

  setHome(){
    this.homeBridge = new this.homeWeb3.eth.Contract(HOME_ABI, this.HOME_BRIDGE_ADDRESS);
    this.getEvents()
    this.getBalance()
    this.homeBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
      this.getBalance()
    })
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
    this.homeBridge.getPastEvents({fromBlock: 0}, (e, homeEvents) => {
      console.log('homeEvents', homeEvents)
      const events = []
      homeEvents.forEach((event) => {
        if(event.event === "Deposit" || event.event === "Withdraw"){
          events.push(event)
        }
      })
      this.events = events;
    })
  }
}

export default HomeStore;