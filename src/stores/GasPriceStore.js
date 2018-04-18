import { observable, computed } from "mobx";
import Web3Utils from 'web3-utils';
import { getGasPrices } from './utils/web3'

class GasPriceStore {
  @observable gasPrices = {};
  gasPricePromise = null;
  constructor(rootStore) {
    this.getGasPrices()
    this.alertStore = rootStore.alertStore;
  }

  async getGasPrices(){
    this.gasPricePromise = getGasPrices().then((data) => {
      console.log(data)
      this.gasPrices = data;
    }).catch((e) => {
      this.alertStore.pushError(e)
    })
  }

  @computed get standardInHex() {
    const toWei = Web3Utils.toWei(this.gasPrices.standard.toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
}

export default GasPriceStore;
