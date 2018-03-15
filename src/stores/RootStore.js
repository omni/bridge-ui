import Web3Store from './Web3Store'
import HomeStore from './HomeStore'
class RootStore {
  constructor() {
    this.web3Store = new Web3Store(this)
    this.homeStore = new HomeStore(this)
  }
}

export default new RootStore();