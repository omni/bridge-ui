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
import homeLogo from '../assets/images/logos/logo-poa-sokol@2x.png'
import foreignLogo from '../assets/images/logos/logo-poa-20@2x.png'
import homeLogoPurple from '../assets/images/logos/logo-poa-sokol-purple@2x.png'
import foreignLogoPurple from '../assets/images/logos/logo-poa-20-purple@2x.png'
import leftImage from '../assets/images/pattern-1.png'
import rightImage from '../assets/images/pattern-2.png'

@inject("RootStore")
@observer
export class Bridge extends React.Component {
  state = {
    reverse: false,
    homeCurrency: 'POA',
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
    const { web3Store, homeStore, alertStore, txStore } = this.props.RootStore
    const { homeCurrency } = this.state
    const { isLessThan, isGreaterThan } = this
    if(web3Store.metamaskNet.id.toString() !== web3Store.homeNet.id.toString()){
      swal("Error", `Please switch metamask network to ${web3Store.homeNet.name}`, "error")
      return
    }
    if(isLessThan(amount, homeStore.minPerTx)){
      alertStore.pushError(`The amount is less than current minimum per transaction amount.\nThe minimum per transaction amount is: ${homeStore.minPerTx} ${homeCurrency}`)
      return
    }
    if(isGreaterThan(amount, homeStore.maxPerTx)){
      alertStore.pushError(`The amount is above current maximum per transaction limit.\nThe maximum per transaction limit is: ${homeStore.maxPerTx} ${homeCurrency}`)
      return
    }
    if(isGreaterThan(amount, homeStore.maxCurrentDeposit)){
      alertStore.pushError(`The amount is above current daily limit.\nThe max deposit today: ${homeStore.maxCurrentDeposit} ${homeCurrency}`)
      return
    }
    if(isGreaterThan(amount, web3Store.defaultAccount.homeBalance)){
      alertStore.pushError("Insufficient balance")
    } else {
      try {
        return txStore.doSend({
        to: homeStore.HOME_BRIDGE_ADDRESS,
        from: web3Store.defaultAccount.address,
        value: Web3Utils.toHex(Web3Utils.toWei(amount)),
        data: '0x'
      })} catch (e) {
        console.error(e)
      }
    }
  }

  async _sendToForeign(amount){
    const { web3Store, foreignStore, alertStore, txStore } = this.props.RootStore
    const { isLessThan, isGreaterThan } = this
    if(web3Store.metamaskNet.id.toString() !== web3Store.foreignNet.id.toString()){
      swal("Error", `Please switch metamask network to ${web3Store.foreignNet.name}`, "error")
      return
    }
    if(isLessThan(amount, foreignStore.minPerTx)){
      alertStore.pushError(`The amount is less than minimum amount per transaction.\nThe min per transaction is: ${foreignStore.minPerTx} ${foreignStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, foreignStore.maxPerTx)){
      alertStore.pushError(`The amount is above maximum amount per transaction.\nThe max per transaction is: ${foreignStore.maxPerTx} ${foreignStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, foreignStore.maxCurrentDeposit)){
      alertStore.pushError(`The amount is above current daily limit.\nThe max withdrawal today: ${foreignStore.maxCurrentDeposit} ${foreignStore.symbol}`)
      return
    }
    if(isGreaterThan(amount, foreignStore.balance)){
      alertStore.pushError(`Insufficient token balance. Your balance is ${foreignStore.balance} ${foreignStore.symbol}`)
    } else {
      try {
        return await txStore.erc677transferAndCall({
        to: foreignStore.FOREIGN_BRIDGE_ADDRESS,
        from: web3Store.defaultAccount.address,
        value: Web3Utils.toHex(Web3Utils.toWei(amount))
      })} catch(e) {
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

    const { reverse, homeCurrency } = this.state
    const { foreignStore, web3Store } = this.props.RootStore
    const homeDisplayName = 'POA ' + web3Store.homeNet.name
    const foreignDisplayName = 'ETH ' + web3Store.foreignNet.name

    const confirmationData = {
      from: reverse ? foreignDisplayName : homeDisplayName,
      to: reverse ? homeDisplayName : foreignDisplayName,
      fromCurrency: reverse ? foreignStore.symbol : homeCurrency,
      toCurrency: reverse ? homeCurrency : foreignStore.symbol,
      amount
    }

    this.setState({ showConfirmation: true, confirmationData})
  }

  onTransferConfirmation = async () => {
    const { alertStore } = this.props.RootStore
    const { reverse } = this.state

    this.setState({showConfirmation: false, confirmationData: {}})
    alertStore.setLoading(true)
    const amount = this.state.amount.trim();
    if(!amount){
      swal("Error", "Please specify amount", "error")
      return
    }
    try {
      if(reverse){
        await this._sendToForeign(amount)
        alertStore.setLoading(false)
      } else {
        await this._sendToHome(amount)
        alertStore.setLoading(false)
      }
    } catch(e) {
      alertStore.setLoading(false)
    }
  }

  loadHomeDetails = () => {
    const { web3Store, homeStore } = this.props.RootStore
    const { homeCurrency } = this.state

    const modalData = {
      isHome: true,
      networkData: web3Store.homeNet,
      url: web3Store.HOME_HTTP_PARITY_URL,
      logo: homeLogoPurple,
      address: homeStore.HOME_BRIDGE_ADDRESS,
      currency: homeCurrency,
      maxCurrentLimit: homeStore.maxCurrentDeposit,
      maxPerTx: homeStore.maxPerTx,
      minPerTx: homeStore.minPerTx,
      totalBalance: homeStore.balance,
      balance: web3Store.defaultAccount.homeBalance
    }

    this.setState({ modalData, showModal: true })
  }

  loadForeignDetails = () => {
    const { web3Store, foreignStore } = this.props.RootStore
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
      totalBalance: foreignStore.totalSupply,
      balance: foreignStore.balance
    }

    this.setState({ modalData, showModal: true })
  }

  render() {
    const { web3Store, foreignStore } = this.props.RootStore
    const { reverse, homeCurrency, showModal, modalData, showConfirmation, confirmationData } = this.state
    const formCurrency = reverse ? foreignStore.symbol : homeCurrency
    return(
      <div className="bridge-container">
        <div className="bridge">
          <BridgeAddress
            isHome={true}
            logo={homeLogo} />
          <div className="bridge-transfer">
            <div className="left-image-wrapper">
              <img className="left-image" src={leftImage} alt=""/>
            </div>
            <div className="bridge-transfer-content">
              <BridgeNetwork
                isHome={true}
                showModal={this.loadHomeDetails}
                networkData={web3Store.homeNet}
                currency={homeCurrency}
                balance={web3Store.defaultAccount.homeBalance} />
              <BridgeForm
                reverse={reverse}
                currency={formCurrency}
                onTransfer={this.onTransfer}
                onInputChange={this.handleInputChange('amount')} />
              <BridgeNetwork
                isHome={false}
                showModal={this.loadForeignDetails}
                networkData={web3Store.foreignNet}
                currency={foreignStore.symbol}
                balance={foreignStore.balance} />
            </div>
            <div className="right-image-wrapper">
              <img className="right-image" src={rightImage} alt=""/>
            </div>
          </div>
          <BridgeAddress
            isHome={false}
            logo={foreignLogo} />
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
