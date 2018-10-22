import React from 'react';
import { inject, observer } from "mobx-react";
import Web3Utils from 'web3-utils'
import swal from 'sweetalert'
import BN from 'bignumber.js'
import { BridgeForm } from './index'
import { BridgeAddress } from './index'
import { BridgeNetwork } from './index'
import { ModalContainer } from './ModalContainer'
import { NetworkDetails } from './NetworkDetails'
import { TransferAlert } from './TransferAlert'
import homeLogoPurple from '../assets/images/logos/logo-poa-sokol-purple@2x.png'
import foreignLogoPurple from '../assets/images/logos/logo-poa-20-purple@2x.png'
import leftImage from '../assets/images/pattern-1.png'
import rightImage from '../assets/images/pattern-2.png'
import { BRIDGE_MODES } from '../stores/utils/bridgeMode'

@inject("RootStore")
@observer
export class Bridge extends React.Component {
  state = {
    reverse: false,
    amount:'',
    modalData: {},
    confirmationData: {},
    showModal: false,
    showConfirmation: false
  }

  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }
  componentDidMount() {
    const { web3Store } = this.props.RootStore
    web3Store.getWeb3Promise.then(() => {
      if(!web3Store.metamaskNet.id || !web3Store.foreignNet.id) {
        this.forceUpdate()
      } else {
        const reverse = web3Store.metamaskNet.id.toString() === web3Store.foreignNet.id.toString()
        if (reverse) {
          this.setState({
            reverse
          })
        }
      }
    })
  }

  componentDidUpdate() {
    const { web3Store } = this.props.RootStore
    web3Store.getWeb3Promise.then(() => {
      const reverse = web3Store.metamaskNet.id.toString() === web3Store.foreignNet.id.toString()
      if (reverse !== this.state.reverse) {
        this.setState({
          reverse
        })
      }
    })
  }

  async _sendToHome(amount){
    const { web3Store, homeStore, alertStore, txStore, bridgeMode } = this.props.RootStore
    const isErcToErcMode = bridgeMode === BRIDGE_MODES.ERC_TO_ERC
    const { isLessThan, isGreaterThan } = this
    if(web3Store.metamaskNet.id.toString() !== web3Store.homeNet.id.toString()){
      swal("Error", `Please switch wallet to ${web3Store.homeNet.name} network`, "error")
      return
    }
    if(isLessThan(amount, homeStore.minPerTx)){
      alertStore.pushError(`The amount is less than current minimum per transaction amount.\nThe minimum per transaction amount is: ${homeStore.minPerTx} ${homeStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, homeStore.maxPerTx)){
      alertStore.pushError(`The amount is above current maximum per transaction limit.\nThe maximum per transaction limit is: ${homeStore.maxPerTx} ${homeStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, homeStore.maxCurrentDeposit)){
      alertStore.pushError(`The amount is above current daily limit.\nThe max deposit today: ${homeStore.maxCurrentDeposit} ${homeStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, homeStore.getDisplayedBalance())){
      alertStore.pushError("Insufficient balance")
    } else {
      try {
        alertStore.setLoading(true)
        if (isErcToErcMode) {
          return txStore.erc677transferAndCall({
            to: homeStore.HOME_BRIDGE_ADDRESS,
            from: web3Store.defaultAccount.address,
            value: Web3Utils.toWei(amount),
            contract: homeStore.tokenContract,
            tokenAddress: homeStore.tokenAddress
          })
        } else {
          const value = Web3Utils.toHex(Web3Utils.toWei(amount))
          return txStore.doSend({
            to: homeStore.HOME_BRIDGE_ADDRESS,
            from: web3Store.defaultAccount.address,
            value,
            data: '0x',
            sentValue: value
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  async _sendToForeign(amount){
    const { web3Store, foreignStore, alertStore, txStore, bridgeMode } = this.props.RootStore
    const isExternalErc20 = bridgeMode === BRIDGE_MODES.ERC_TO_ERC || bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE
    const { isLessThan, isGreaterThan } = this
    if(web3Store.metamaskNet.id.toString() !== web3Store.foreignNet.id.toString()){
      swal("Error", `Please switch wallet to ${web3Store.foreignNet.name} network`, "error")
      return
    }
    if(!isExternalErc20 && isLessThan(amount, foreignStore.minPerTx)){
      alertStore.pushError(`The amount is less than minimum amount per transaction.\nThe min per transaction is: ${foreignStore.minPerTx} ${foreignStore.symbol}`)
      return
    }
    if(!isExternalErc20 && isGreaterThan(amount, foreignStore.maxPerTx)){
      alertStore.pushError(`The amount is above maximum amount per transaction.\nThe max per transaction is: ${foreignStore.maxPerTx} ${foreignStore.symbol}`)
      return
    }
    if(!isExternalErc20 && isGreaterThan(amount, foreignStore.maxCurrentDeposit)){
      alertStore.pushError(`The amount is above current daily limit.\nThe max withdrawal today: ${foreignStore.maxCurrentDeposit} ${foreignStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, foreignStore.balance)){
      alertStore.pushError(`Insufficient token balance. Your balance is ${foreignStore.balance} ${foreignStore.symbol}`)
    } else {
      try {
        alertStore.setLoading(true)
        if (isExternalErc20) {
          return await txStore.erc20transfer({
            to: foreignStore.FOREIGN_BRIDGE_ADDRESS,
            from: web3Store.defaultAccount.address,
            value: Web3Utils.toWei(amount)
          })
        } else {
          return await txStore.erc677transferAndCall({
            to: foreignStore.FOREIGN_BRIDGE_ADDRESS,
            from: web3Store.defaultAccount.address,
            value: Web3Utils.toHex(Web3Utils.toWei(amount)),
            contract: foreignStore.tokenContract,
            tokenAddress: foreignStore.tokenAddress
          })
        }
      } catch(e) {
        console.error(e)
      }
    }
  }

  isLessThan = (amount, base) => new BN(amount).lt(new BN(base))

  isGreaterThan = (amount, base) => new BN(amount).gt(new BN(base))

  onTransfer = async (e) => {
    e.preventDefault()

    const amount = this.state.amount.trim();
    if(!amount){
      swal("Error", "Please specify amount", "error")
      return
    }

    const { foreignStore, web3Store, homeStore } = this.props.RootStore

    if((web3Store.metamaskNotSetted && web3Store.metamaskNet.name === '')
      || web3Store.defaultAccount.address === undefined) {
      web3Store.showInstallMetamaskAlert()
      return
    }

    const { reverse } = this.state
    const homeDisplayName = homeStore.networkName
    const foreignDisplayName = foreignStore.networkName

    const confirmationData = {
      from: reverse ? foreignDisplayName : homeDisplayName,
      to: reverse ? homeDisplayName : foreignDisplayName,
      fromCurrency: reverse ? foreignStore.symbol : homeStore.symbol,
      toCurrency: reverse ? homeStore.symbol : foreignStore.symbol,
      amount,
      reverse
    }

    this.setState({ showConfirmation: true, confirmationData})
  }

  onTransferConfirmation = async () => {
    const { alertStore } = this.props.RootStore
    const { reverse } = this.state

    this.setState({showConfirmation: false, confirmationData: {}})
    const amount = this.state.amount.trim();
    if(!amount){
      swal("Error", "Please specify amount", "error")
      return
    }

    try {
      if(reverse){
        await this._sendToForeign(amount)
      } else {
        await this._sendToHome(amount)
      }
    } catch(e) {
      if(!e.message.includes('not mined within 50 blocks') && !e.message.includes('Failed to subscribe to new newBlockHeaders')) {
        alertStore.setLoading(false)
      }
    }
  }

  loadHomeDetails = () => {
    const { web3Store, homeStore, bridgeMode } = this.props.RootStore
    const isErcToErcMode = bridgeMode === BRIDGE_MODES.ERC_TO_ERC
    const isExternalErc20 = bridgeMode === BRIDGE_MODES.ERC_TO_ERC || bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE

    const modalData = {
      isHome: true,
      networkData: web3Store.homeNet,
      url: web3Store.HOME_HTTP_PARITY_URL,
      logo: homeLogoPurple,
      address: homeStore.HOME_BRIDGE_ADDRESS,
      currency: homeStore.symbol,
      maxCurrentLimit: homeStore.maxCurrentDeposit,
      maxPerTx: homeStore.maxPerTx,
      minPerTx: homeStore.minPerTx,
      totalBalance: homeStore.balance,
      balance: homeStore.getDisplayedBalance(),
      displayTokenAddress: isErcToErcMode,
      tokenAddress: homeStore.tokenAddress,
      tokenName: homeStore.tokenName,
      displayBridgeLimits: true,
      nativeSupplyTitle: !isExternalErc20,
      getExplorerAddressUrl: address => homeStore.getExplorerAddressUrl(address)
    }

    this.setState({ modalData, showModal: true })
  }

  loadForeignDetails = () => {
    const { web3Store, foreignStore, bridgeMode } = this.props.RootStore
    const isExternalErc20 = bridgeMode === BRIDGE_MODES.ERC_TO_ERC || bridgeMode === BRIDGE_MODES.ERC_TO_NATIVE
    const foreignURL = new URL(web3Store.FOREIGN_HTTP_PARITY_URL)
    const foreignDisplayUrl = `${foreignURL.protocol}//${foreignURL.hostname}`

    const modalData = {
      isHome: false,
      networkData: web3Store.foreignNet,
      url: foreignDisplayUrl,
      logo: foreignLogoPurple,
      address: foreignStore.FOREIGN_BRIDGE_ADDRESS,
      currency: foreignStore.symbol,
      maxCurrentLimit: foreignStore.maxCurrentDeposit,
      maxPerTx: foreignStore.maxPerTx,
      minPerTx: foreignStore.minPerTx,
      tokenAddress: foreignStore.tokenAddress,
      tokenName: foreignStore.tokenName,
      totalSupply: foreignStore.totalSupply,
      balance: foreignStore.balance,
      displayTokenAddress: true,
      displayBridgeLimits: !isExternalErc20,
      getExplorerAddressUrl: address => foreignStore.getExplorerAddressUrl(address)
    }

    this.setState({ modalData, showModal: true })
  }

  render() {
    const { web3Store, foreignStore, homeStore } = this.props.RootStore
    const { reverse, showModal, modalData, showConfirmation, confirmationData } = this.state
    const formCurrency = reverse ? foreignStore.symbol : homeStore.symbol

    if(showModal && Object.keys(modalData).length !== 0) {
      if(modalData.isHome && modalData.balance !== homeStore.getDisplayedBalance()) {
        modalData.balance = homeStore.getDisplayedBalance()
      } else if(!modalData.isHome && modalData.balance !== foreignStore.balance) {
        modalData.balance= foreignStore.balance
      }
    }

    const homeNetworkName = homeStore.networkName
    const foreignNetworkName = foreignStore.networkName

    return(
      <div className="bridge-container">
        <div className="bridge">
          <BridgeAddress
            isHome={true}
            reverse={reverse}
            labelName={reverse ? foreignStore.symbol : homeStore.symbol} />
          <div className="bridge-transfer">
            <div className="left-image-wrapper">
              <img className="left-image" src={leftImage} alt=""/>
            </div>
            <div className="bridge-transfer-content">
              <div className="bridge-transfer-content-background">
                <BridgeNetwork
                  isHome={true}
                  showModal={reverse ? this.loadForeignDetails : this.loadHomeDetails}
                  networkTitle={reverse ? foreignNetworkName : homeNetworkName}
                  currency={reverse ? foreignStore.symbol : homeStore.symbol}
                  balance={reverse ? foreignStore.balance : homeStore.getDisplayedBalance()} />
                <BridgeForm
                  displayArrow={!web3Store.metamaskNotSetted}
                  reverse={reverse}
                  currency={formCurrency}
                  onTransfer={this.onTransfer}
                  onInputChange={this.handleInputChange('amount')} />
                <BridgeNetwork
                  isHome={false}
                  showModal={reverse ? this.loadHomeDetails : this.loadForeignDetails}
                  networkTitle={reverse ? homeNetworkName : foreignNetworkName}
                  currency={reverse ? homeStore.symbol : foreignStore.symbol}
                  balance={reverse ? homeStore.getDisplayedBalance() : foreignStore.balance} />
              </div>
            </div>
            <div className="right-image-wrapper">
              <img className="right-image" src={rightImage} alt=""/>
            </div>
          </div>
          <BridgeAddress
            isHome={false}
            reverse={reverse}
            labelName={reverse ? homeStore.symbol : foreignStore.symbol} />
          <ModalContainer
            hideModal={() => {this.setState({showModal: false})}}
            showModal={showModal}
          >
            <NetworkDetails {...modalData}/>
          </ModalContainer>
          <ModalContainer
            showModal={showConfirmation}
          >
            <TransferAlert
              onConfirmation={this.onTransferConfirmation}
              onCancel={() => {this.setState({showConfirmation: false, confirmationData: {}})}}
              {...confirmationData} />
          </ModalContainer>
        </div>
      </div>
    )
  }
}
