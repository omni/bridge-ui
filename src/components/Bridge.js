import React from 'react';
import { inject, observer } from "mobx-react";
import Web3Utils from 'web3-utils'
import swal from 'sweetalert'
import BN from 'bignumber.js'
import { BridgeForm } from './index'
import { BridgeNetwork } from './index'



@inject("RootStore")
@observer
export class Bridge extends React.Component {
  state = {
    reverse: false,
    homeCurrency: 'POA',
    amount:''
  }

  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value
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
        data: '0x00'
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
    const { alertStore } = this.props.RootStore
    const { reverse } = this.state
    e.preventDefault()
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

  onSwitch = (e) => {
    e.preventDefault()
    this.setState({reverse: !this.state.reverse})
  }

  render() {
    const { web3Store, homeStore, foreignStore } = this.props.RootStore
    const { reverse, homeCurrency } = this.state
    const foreignURL = new URL(web3Store.FOREIGN_HTTP_PARITY_URL)
    const foreignDisplayUrl = `${foreignURL.protocol}//${foreignURL.hostname}`
    const formCurrency = reverse ? foreignStore.symbol : homeCurrency
    return(
      <div className="bridge">
        <BridgeNetwork
          isHome={true}
          networkData={web3Store.homeNet}
          url={web3Store.HOME_HTTP_PARITY_URL}
          address={homeStore.HOME_BRIDGE_ADDRESS}
          currency={homeCurrency}
          maxCurrentLimit={homeStore.maxCurrentDeposit}
          maxPerTx={homeStore.maxPerTx}
          minPerTx={homeStore.minPerTx}
          totalBalance={homeStore.balance}
          balance={web3Store.defaultAccount.homeBalance} />
        <BridgeForm
          reverse={reverse}
          currency={formCurrency}
          homeNetName={web3Store.homeNet.name}
          foreignNetName={web3Store.foreignNet.name}
          onSwitch={this.onSwitch}
          onTransfer={this.onTransfer}
          onInputChange={this.handleInputChange('amount')} />
        <BridgeNetwork
          isHome={false}
          networkData={web3Store.foreignNet}
          url={foreignDisplayUrl}
          address={foreignStore.FOREIGN_BRIDGE_ADDRESS}
          currency={foreignStore.symbol}
          tokenAddress={foreignStore.tokenAddress}
          maxCurrentLimit={foreignStore.maxCurrentDeposit}
          maxPerTx={foreignStore.maxPerTx}
          minPerTx={foreignStore.minPerTx}
          totalBalance={foreignStore.totalSupply}
          balance={foreignStore.balance} />
      </div>
    )
  }
}
