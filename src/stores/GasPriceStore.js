import { observable, computed } from "mobx";
import Web3Utils from 'web3-utils';
import { getGasPrices } from './utils/web3'

const GAS_PRICE_SPEED_TYPE = process.env.REACT_APP_GAS_PRICE_SPEED_TYPE || 'fast'

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

  @computed get gasPriceInHex() {
    const toWei = Web3Utils.toWei(this.gasPrices[GAS_PRICE_SPEED_TYPE].toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
}

export default GasPriceStore;
