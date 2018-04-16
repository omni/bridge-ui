import { action, observable } from "mobx";
import Web3Utils from 'web3-utils'
import FOREIGN_ABI from '../abis/ForeignBridge.json'
import ERC677_ABI from '../abis/ERC677.json'

class TxStore {
  @observable txs = []
  txHashToIndex = {}
  constructor(rootStore) {
    this.web3Store = rootStore.web3Store
    this.gasPriceStore = rootStore.gasPriceStore
    this.errorsStore = rootStore.errorsStore
    this.foreignStore = rootStore.foreignStore
  }

  @action
  async doSend({to, gasPrice, from, value, data}){
    const index = this.txs.length;
    return this.web3Store.getWeb3Promise.then(async ()=> {
      if(!this.web3Store.defaultAccount){
        this.errorsStore.pushError({label: "Error", message: "Please unlock metamask", type: "error"})
        return
      }
      try {
        const gas = await this.web3Store.injectedWeb3.eth.estimateGas({
          to,
          gasPrice,
          from,
          value,
          data
        })
        return this.web3Store.injectedWeb3.eth.sendTransaction({
          to,
          gasPrice,
          gas: Web3Utils.toHex(gas.toString()),
          from,
          value,
          data
        }).on('transactionHash', (hash) => {
          console.log('txHash', hash)
          this.txHashToIndex[hash] = index;
          this.txs[index] = {status: 'pending', name: `Sending ${to} ${value}`, hash}
          this.getTxReceipt(hash)
        }).on('error', (e) => {
          console.error(e)
          this.errorsStore.pushError({label: "Error", message: e.message, type: "error"});
        })
      } catch(e) {
        console.error(e.message)
        this.errorsStore.pushError({label: "Error", message: e.message, type: "error"});
      }
    })
  }

  @action
  async erc677transferAndCall({to, gasPrice, from, value}){
    try {
      const foreignBridge = new this.web3Store.foreignWeb3.eth.Contract(FOREIGN_ABI, this.foreignStore.FOREIGN_BRIDGE_ADDRESS);
      const tokenAddress = await foreignBridge.methods.erc677token().call()
      const tokenContract = new this.web3Store.foreignWeb3.eth.Contract(ERC677_ABI, tokenAddress);

      return this.web3Store.getWeb3Promise.then(async () => {
        if(this.web3Store.defaultAccount.address){
          const data = await tokenContract.methods.transferAndCall(
            to, value, '0x00'
          ).encodeABI()
          return this.doSend({to: tokenAddress, from, value: '0x00', gasPrice, data})
        } else {
          this.errorsStore.pushError({label: 'Error', message: 'Please unlock metamask', type:'error'});    
        }
      })
    } catch(e) {
      console.error(e)
      this.errorsStore.pushError(e);
    }

  }

  async getTxReceipt(hash){
    const web3 = this.web3Store.injectedWeb3;
    web3.eth.getTransaction(hash, (error, res) => {
      if(res && res.blockNumber){
        this.getTxStatus(hash)
      } else {
        console.log('not mined yet', hash)
        setTimeout(() => {
          this.getTxReceipt(hash)
        }, 5000)
      }
    })
  }

  async getTxStatus(hash) {
    console.log('GET TX STATUS', hash)
    const web3 = this.web3Store.injectedWeb3;
    web3.eth.getTransactionReceipt(hash, (error, res) => {
      if(res && res.blockNumber){
        if(res.status === '0x1'){
          const index = this.txHashToIndex[hash]
          this.txs[index].status = `mined`
          this.errorsStore.pushError({
            label: "Success",
            message: `${hash} Mined successfully on ${this.web3Store.metamaskNet.name} at block number ${res.blockNumber}`,
            type: "success"})
        } else {
          const index = this.txHashToIndex[hash]
          this.txs[index].status = `error`
          this.txs[index].name = `Mined but with errors. Perhaps out of gas`
          this.errorsStore.pushError({label: "Error", message: `${hash} Mined but with errors. Perhaps out of gas`, type: "error"})
        }
      } else {
        this.getTxStatus(hash)
      }
    })
  }

}

export default TxStore;