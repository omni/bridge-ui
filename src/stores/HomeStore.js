import { action, observable } from 'mobx';
import HOME_ABI from '../abis/HomeBridge.json';

const HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;

class HomeStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  homeBridge = {};

  constructor (rootStore) {
    this.setHome(rootStore.web3Store.homeWeb3)
  }

  setHome(homeWeb3){
    this.homeBridge = new homeWeb3.eth.Contract(HOME_ABI, HOME_BRIDGE_ADDRESS);
    this.getEvents()
    this.homeBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
    })
  }

  getEvents() {
    this.homeBridge.getPastEvents({fromBlock: 0}, (e, homeEvents) => {
      console.log(homeEvents)
      const events = []
      homeEvents.forEach((event) => {
        if(event.event === "Deposit" || event.event === "Withdraw"){
          events.push(event)
        }
      })
      this.events = events;
    })
  }

  async fetch () {
    try {
      // const state = await Backend.home.state();

      this.setState({});
    } catch (error) {
      console.error(error);
    }

    this.setLoading(false);
  }

  @action setLoading (loading) {
    this.loading = loading;
  }

  @action setState (state) {
    this.state = state;
  }
}

export default HomeStore;



// WEBPACK FOOTER //
// ./src/stores/home.ts