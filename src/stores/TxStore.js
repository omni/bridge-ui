import { action, observable } from "mobx";
import { estimateGas } from './utils/web3'
import { addPendingTransaction } from './utils/testUtils'

class TxStore {
  @observable txs = []
  txHashToIndex = {}
  constructor(rootStore) {
    this.web3Store = rootStore.web3Store
    this.gasPriceStore = rootStore.gasPriceStore
    this.alertStore = rootStore.alertStore
    this.foreignStore = rootStore.foreignStore
    this.homeStore = rootStore.homeStore
  }

  @action
  async doSend({to, from, value, data}){
    const index = this.txs.length;
    return this.web3Store.getWeb3Promise.then(async ()=> {
      if(!this.web3Store.defaultAccount){
        this.alertStore.pushError("Please unlock metamask")
        return
      }
      try {
        const gasPrice = this.gasPriceStore.standardInHex
        const gas = await estimateGas(this.web3Store.injectedWeb3, to, gasPrice, from, value, data)
        return this.web3Store.injectedWeb3.eth.sendTransaction({
          to,
          gasPrice,
          gas,
          from,
          value,
          data
        }).on('transactionHash', (hash) => {
          console.log('txHash', hash)
          this.txHashToIndex[hash] = index;
          this.txs[index] = {status: 'pending', name: `Sending ${to} ${value}`, hash}
          this.alertStore.setLoadingStepIndex(1)
          addPendingTransaction()
          this.getTxReceipt(hash)
        }).on('error', (e) => {
          this.alertStore.setLoading(false)
          this.alertStore.pushError('Transaction rejected on Metamask');
        })
      } catch(e) {
        this.alertStore.pushError(e.message);
      }
    })
  }

  @action
  async erc677transferAndCall({to, from, value}){
    try {
      return this.web3Store.getWeb3Promise.then(async () => {
        if(this.web3Store.defaultAccount.address){
          const data = await this.foreignStore.tokenContract.methods.transferAndCall(
            to, value, '0x00'
          ).encodeABI()
          return this.doSend({to: this.foreignStore.tokenAddress, from, value: '0x00', data})
        } else {
          this.alertStore.pushError('Please unlock metamask');
        }
      })
    } catch(e) {
      this.alertStore.pushError(e);
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
    const web3 = this.web3Store.injectedWeb3;
    web3.eth.getTransactionReceipt(hash, (error, res) => {
      if(res && res.blockNumber){
        if(res.status === '0x1'){
          const index = this.txHashToIndex[hash]
          this.txs[index].status = `mined`
          if(this.web3Store.metamaskNet.name === this.web3Store.homeNet.name) {
            this.foreignStore.addWaitingForConfirmation(hash)
          } else {
            const blockConfirmations = this.foreignStore.latestBlockNumber - res.blockNumber
            if(blockConfirmations >= 8) {
              this.alertStore.setBlockConfirmations(blockConfirmations)
              this.alertStore.setLoadingStepIndex(2)
              this.homeStore.addWaitingForConfirmation(hash)
            } else {
              if(blockConfirmations > 0) {
                this.alertStore.setBlockConfirmations(blockConfirmations)
              }
              this.getTxStatus(hash)
            }
          }
        } else {
          this.alertStore.setLoading(false)
          const index = this.txHashToIndex[hash]
          this.txs[index].status = `error`
          this.txs[index].name = `Mined but with errors. Perhaps out of gas`
          this.alertStore.pushError(`${hash} Mined but with errors. Perhaps out of gas`)
        }
      } else {
        this.getTxStatus(hash)
      }
    })
  }

}

export default TxStore;
