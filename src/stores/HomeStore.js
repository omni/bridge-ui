import { action, observable } from 'mobx';
import { abi as BRIDGE_VALIDATORS_ABI } from '../contracts/BridgeValidators.json'
import { abi as ERC677_ABI } from '../contracts/ERC677BridgeToken.json'
import { abi as BLOCK_REWARD_ABI } from '../contracts/IBlockReward'
import { getBlockNumber, getBalance } from './utils/web3'
import {
  getMaxPerTxLimit,
  getMinPerTxLimit,
  getCurrentLimit,
  getPastEvents,
  getMessage,
  getErc677TokenAddress,
  getSymbol,
  getTotalSupply,
  getBalanceOf,
  mintedTotally,
  totalBurntCoins,
  getBridgeValidators,
  getName
} from './utils/contract'
import { balanceLoaded, removePendingTransaction } from './utils/testUtils'
import Web3Utils from 'web3-utils'
import BN from 'bignumber.js'
import { getBridgeABIs, getUnit, BRIDGE_MODES } from './utils/bridgeMode'
import ERC20Bytes32Abi from './utils/ERC20Bytes32.abi'

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class HomeStore {
  @observable state = null;
  @observable loading = true;
  @observable events = [];
  @observable errors = [];
  @observable balance = "";
  @observable filter = false;
  @observable maxCurrentDeposit = "";
  @observable maxPerTx = "";
  @observable latestBlockNumber = 0;
  @observable validators = []
  @observable homeBridgeValidators = ''
  @observable requiredSignatures = 0
  @observable dailyLimit = 0
  @observable totalSpentPerDay = 0
  @observable tokenAddress = '';
  @observable symbol = process.env.REACT_APP_HOME_NATIVE_NAME || 'NONAME';
  @observable tokenName = '';
  @observable userBalance = 0
  @observable statistics = {
    deposits: 0,
    depositsValue: BN(0),
    withdraws: 0,
    withdrawsValue: BN(0),
    totalBridged: BN(0),
    users: new Set(),
    finished: false
  }
  networkName = process.env.REACT_APP_HOME_NETWORK_NAME || 'Unknown'
  filteredBlockNumber = 0
  homeBridge = {};
  HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;
  explorerTxTemplate = process.env.REACT_APP_HOME_EXPLORER_TX_TEMPLATE || ''
  explorerAddressTemplate = process.env.REACT_APP_HOME_EXPLORER_ADDRESS_TEMPLATE || ''
  tokenContract = {}
  blockRewardContract = {}

  constructor (rootStore) {
    this.homeWeb3 = rootStore.web3Store.homeWeb3
    this.web3Store = rootStore.web3Store
    this.alertStore = rootStore.alertStore
    this.rootStore = rootStore
    this.waitingForConfirmation = new Set()
    this.setHome()
  }

  async setHome(){
    if (!this.rootStore.bridgeModeInitialized) {
      setTimeout(() => this.setHome(), 200)
      return
    }
    const { HOME_ABI } = getBridgeABIs(this.rootStore.bridgeMode)
    this.homeBridge = new this.homeWeb3.eth.Contract(HOME_ABI, this.HOME_BRIDGE_ADDRESS);
    if (this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_ERC) {
      await this.getTokenInfo()
    } else if(this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE) {
      await this.getBlockRewardContract()
    }
    await this.getBlockNumber()
    this.getMinPerTxLimit()
    this.getMaxPerTxLimit()
    this.getEvents()
    this.getBalance()
    this.getCurrentLimit()
    this.getValidators()
    this.getStatistics()
    setInterval(() => {
      this.getEvents()
      this.getBalance()
      this.getBlockNumber()
    }, 5000)
    setInterval(() => {
      this.getCurrentLimit()
    }, 10000)
  }

  @action
  async getTokenInfo() {
    try {
      this.tokenAddress = await getErc677TokenAddress(this.homeBridge)
      this.tokenContract = new this.homeWeb3.eth.Contract(ERC677_ABI, this.tokenAddress);
      this.symbol = await getSymbol(this.tokenContract)
      this.tokenName = await getName(this.tokenContract)
      const alternativeContract = new this.homeWeb3.eth.Contract(ERC20Bytes32Abi, this.tokenAddress);
      try {
        this.symbol =await getSymbol(this.tokenContract)
      } catch(e) {
        this.symbol = this.homeWeb3.utils.hexToAscii(await getSymbol(alternativeContract)).replace(/\u0000*$/, '')
      }
      try {
        this.tokenName = await getName(this.tokenContract)
      } catch(e) {
        this.tokenName = this.homeWeb3.utils.hexToAscii(await getName(alternativeContract)).replace(/\u0000*$/, '')
      }
    } catch(e) {
      console.error(e)
    }
  }

  @action
  async getBlockNumber() {
    try {
      this.latestBlockNumber = await getBlockNumber(this.homeWeb3)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMaxPerTxLimit(){
    try {
      this.maxPerTx = await getMaxPerTxLimit(this.homeBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getMinPerTxLimit(){
    try {
      this.minPerTx = await getMinPerTxLimit(this.homeBridge)
    } catch(e){
      console.error(e)
    }
  }

  @action
  async getBalance() {
    try {
      if (this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_ERC) {
        this.balance = await getTotalSupply(this.tokenContract)
        this.web3Store.getWeb3Promise.then(async () => {
          this.userBalance = await getBalanceOf(this.tokenContract, this.web3Store.defaultAccount.address)
          balanceLoaded()
        })
      } else if (this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE) {
        const mintedCoins = await mintedTotally(this.blockRewardContract)
        const burntCoins = await totalBurntCoins(this.homeBridge)
        this.balance = Web3Utils.fromWei(mintedCoins.minus(burntCoins).toString(10))
      } else {
        this.balance = await getBalance(this.homeWeb3, this.HOME_BRIDGE_ADDRESS)
      }
    } catch(e) {
      console.error(e)
      this.errors.push(e)
    }
  }

  @action
  async getEvents(fromBlock, toBlock) {
    try {
      fromBlock = fromBlock || this.filteredBlockNumber || this.latestBlockNumber - 50
      toBlock =  toBlock || this.filteredBlockNumber || "latest"

      if(fromBlock < 0) {
        fromBlock = 0
      }

      let events = await getPastEvents(this.homeBridge, fromBlock, toBlock)

      let homeEvents = []
      await asyncForEach(events, (async (event) => {
        if(event.event === "SignedForUserRequest" || event.event === "CollectedSignatures") {
          event.signedTxHash = await this.getSignedTx(event.returnValues.messageHash)
        }
        homeEvents.push(event)
      }))

      if(!this.filter){
        this.events = homeEvents;
      }

      if(this.waitingForConfirmation.size) {
        const confirmationEvents = homeEvents.filter((event) => event.event === "AffirmationCompleted" && this.waitingForConfirmation.has(event.returnValues.transactionHash))
        confirmationEvents.forEach(event => {
          this.alertStore.setLoadingStepIndex(3)
          const urlExplorer = this.getExplorerTxUrl(event.transactionHash)
          const unitReceived = getUnit(this.rootStore.bridgeMode).unitHome
          setTimeout(() => {
            this.alertStore.pushSuccess(`${unitReceived} received on ${this.networkName} on Tx
              <a href='${urlExplorer}' target='blank' style="overflow-wrap: break-word;word-wrap: break-word;">
              ${event.transactionHash}</a>`, this.alertStore.HOME_TRANSFER_SUCCESS)}
            , 2000)
          this.waitingForConfirmation.delete(event.returnValues.transactionHash)
        })

        if(confirmationEvents.length) {
          removePendingTransaction()
        }
      }

      return homeEvents
    } catch(e) {
      this.alertStore.pushError(`Cannot establish connection to Home Network.\n
                 Please make sure you have set it up in env variables`, this.alertStore.HOME_CONNECTION_ERROR)
    }
  }

  async getSignedTx(messageHash){
    try {
      const message = await getMessage(this.homeBridge, messageHash)
      return "0x" + message.substring(106, 170);
    } catch(e){
      console.error(e)
    }
  }

  getExplorerTxUrl(txHash) {
    return this.explorerTxTemplate.replace('%s', txHash)
  }

  getExplorerAddressUrl(address) {
    return this.explorerAddressTemplate.replace('%s', address)
  }

  @action
  async filterByTxHashInReturnValues(transactionHash) {
    const events = await this.getEvents(1,"latest");
    this.events = events.filter((event) => event.returnValues.transactionHash === transactionHash)
  }
  @action
  async filterByTxHash(transactionHash) {
    const events = await this.getEvents(1,"latest");
    this.events = events.filter((event) => event.transactionHash === transactionHash)
    if(this.events.length > 0 && this.events[0].returnValues && this.events[0].returnValues.transactionHash) {
      await this.rootStore.foreignStore.filterByTxHashInReturnValues(this.events[0].returnValues.transactionHash)
    }
  }

  @action
  setFilter(value){
    this.filter = value
  }

  @action
  async setBlockFilter(blockNumber){
    this.filteredBlockNumber = blockNumber
    this.events = await this.getEvents()
  }

  @action
  async getCurrentLimit(){
    try {
      const result = await getCurrentLimit(this.homeBridge)
      this.maxCurrentDeposit = result.maxCurrentDeposit
      this.dailyLimit = result.dailyLimit
      this.totalSpentPerDay = result.totalSpentPerDay
    } catch(e){
      console.error(e)
    }
  }

  addWaitingForConfirmation(hash) {
    this.waitingForConfirmation.add(hash)
    this.setBlockFilter(0)
    this.rootStore.foreignStore.setBlockFilter(0)
  }

  @action
  async getValidators(){
    try {
      const homeValidatorsAddress = await this.homeBridge.methods.validatorContract().call()
      this.homeBridgeValidators = new this.homeWeb3.eth.Contract(BRIDGE_VALIDATORS_ABI, homeValidatorsAddress);
      this.validators =  await getBridgeValidators(this.homeBridgeValidators)
      this.requiredSignatures = await this.homeBridgeValidators.methods.requiredSignatures().call()
    } catch(e){
      console.error(e)
    }
  }


  async getStatistics() {
    try {
      const events = await getPastEvents(this.homeBridge, 0, 'latest')
      this.processLargeArrayAsync(events, this.processEvent)
    } catch(e){
      console.error(e)
    }
  }

  processEvent = (event) => {
    this.statistics.users.add(event.returnValues.recipient)
    if(event.event === "UserRequestForSignature") {
      this.statistics.deposits++
      this.statistics.depositsValue = this.statistics.depositsValue.plus(BN(Web3Utils.fromWei(event.returnValues.value)))
    } else if (event.event === "AffirmationCompleted") {
      this.statistics.withdraws++
      this.statistics.withdrawsValue = this.statistics.withdrawsValue.plus(BN(Web3Utils.fromWei(event.returnValues.value)))
    }
  }

  processLargeArrayAsync(array, fn, maxTimePerChunk) {
    maxTimePerChunk = maxTimePerChunk || 16;
    let index = 0;

    function now() {
      return new Date().getTime();
    }

    const doChunk = () => {
      const startTime = now();
      while (index < array.length && (now() - startTime) <= maxTimePerChunk) {
        // callback called with args (value, index, array)
        fn.call(null, array[index], index, array);
        ++index;
      }
      if (index < array.length) {
        setTimeout(doChunk, 0);
      } else {
        this.statistics.finished = true
        this.statistics.totalBridged = this.statistics.depositsValue.plus(this.statistics.withdrawsValue)
      }
    }
    doChunk();
  }

  getDailyQuotaCompleted() {
    return this.dailyLimit ? this.totalSpentPerDay / this.dailyLimit * 100 : 0
  }

  getDisplayedBalance() {
    return this.rootStore.bridgeMode === BRIDGE_MODES.ERC_TO_ERC ? this.userBalance : this.web3Store.defaultAccount.homeBalance
  }

  async getBlockRewardContract () {
    const blockRewardAddress = await this.homeBridge.methods.blockRewardContract().call()
    this.blockRewardContract = new this.homeWeb3.eth.Contract(BLOCK_REWARD_ABI, blockRewardAddress)
  }
}

export default HomeStore;
