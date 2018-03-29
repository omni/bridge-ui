import React from 'react';
import { inject, observer } from "mobx-react";
import poa from '../assets/images/poa@2x.png';
import eth from '../assets/images/eth@2x.png';
import { CSSTransition } from 'react-transition-group'
import Web3Utils from 'web3-utils'
import swal from 'sweetalert'
import BN from 'bignumber.js'

const Fade = ({ children, ...props }) => (
  <CSSTransition
    {...props}
    timeout={1000}
    classNames="fade"
  >
    {children}
  </CSSTransition>
);


@inject("RootStore")
@observer
export class Bridge extends React.Component {
  constructor(props) {
    super(props);
    this.homeStore = props.RootStore.homeStore;
    this.foreignStore = props.RootStore.foreignStore;
    this.web3Store = props.RootStore.web3Store;
    this.txStore = props.RootStore.txStore;
    this.errorsStore = props.RootStore.errorsStore;
    this.gasPriceStore = props.RootStore.gasPriceStore;
    this.homeCurrency = 'POA'
    this.onSwitch = this.onSwitch.bind(this)
    this.state = {
      reverse: false
    }
    this.onTransfer = this.onTransfer.bind(this)
  }

  _sendToHome(amount){
    if(this.web3Store.metamaskNet.id.toString() !== this.web3Store.homeNet.id.toString()){
      swal("Error", `Please switch metamask network to ${this.web3Store.homeNet.name}`, "error")
      return
    }
    if(new BN(amount).gt(new BN(this.homeStore.maxPerTx))){
      this.errorsStore.pushError({
        label: "Error",
        type:"error",
        message: `The amount is above current maximum per transaction limit.\nThe maximum per transaction limit is: ${this.homeStore.maxPerTx} ${this.homeCurrency}`})
      return
    }
    if(new BN(amount).gt(new BN(this.homeStore.maxCurrentDeposit))){
      this.errorsStore.pushError({
        label: "Error",
        type:"error",
        message: `The amount is above current daily limit.\nThe max deposit today: ${this.homeStore.maxCurrentDeposit} ${this.homeCurrency}`})
      return
    }
    if(new BN(amount).gt(new BN(this.web3Store.defaultAccount.homeBalance))){
      this.errorsStore.pushError({label: "Error", type:"error", message: "Insufficient balance"})
    } else {
      this.txStore.doSend({
        to: this.homeStore.HOME_BRIDGE_ADDRESS,
        gasPrice: Web3Utils.toHex(Web3Utils.toWei(this.gasPriceStore.gasPrices.standard.toString(), 'gwei')),
        from: this.web3Store.defaultAccount.address,
        value: Web3Utils.toHex(Web3Utils.toWei(amount)),
        data: '0x00'
      })
    }
  }

  _sendToForeign(amount){
    if(this.web3Store.metamaskNet.id.toString() !== this.web3Store.foreignNet.id.toString()){
      swal("Error", `Please switch metamask network to ${this.web3Store.foreignNet.name}`, "error")
      return
    }
    if(new BN(amount).gt(new BN(this.homeStore.maxPerTx))){
      this.errorsStore.pushError({
        label: "Error",
        type:"error",
        message: `The amount is above maximum amount per transaction.\nThe max per transaction is: ${this.foreignStore.maxPerTx} ${this.foreignStore.symbol}`})
      return
    }
    if(new BN(amount).gt(new BN(this.foreignStore.maxCurrentDeposit))){
      this.errorsStore.pushError({
        label: "Error",
        type:"error",
        message: `The amount is above current daily limit.\nThe max withdrawal today: ${this.foreignStore.maxCurrentDeposit} ${this.foreignStore.symbol}`})
      return
    }
    if(new BN(amount).gt(new BN(this.foreignStore.balance))){
      this.errorsStore.pushError({
        label: "Error",
        type:"error",
        message: `Insufficient token balance. Your balance is ${this.foreignStore.balance} ${this.foreignStore.symbol}`})
      return
    } else {
      this.txStore.erc677transferAndCall({
        to: this.foreignStore.FOREIGN_BRIDGE_ADDRESS,
        gasPrice: Web3Utils.toHex(Web3Utils.toWei(this.gasPriceStore.gasPrices.standard.toString(), 'gwei')),
        from: this.web3Store.defaultAccount.address,
        value: Web3Utils.toHex(Web3Utils.toWei(amount))
      })
    }
  }

  onTransfer(e){
    e.preventDefault()
    let amount = this.refs.amount.value.trim();
    if(!amount){
      swal("Error", "Please specify amount", "error")
      return
    }
    if(this.state.reverse){
      this._sendToForeign(amount)
    } else {
      this._sendToHome(amount)
    }
  }

  onSwitch(e){
    e.preventDefault()
    this.setState({reverse: !this.state.reverse})
  }
  render() {
    let reverse, netWorkNames, currency;
    if(this.state.reverse) {
      reverse = 'bridge-form-button_reverse';
      currency = this.foreignStore.symbol;
      netWorkNames = `${this.web3Store.foreignNet.name} - ${this.web3Store.homeNet.name}`;
    } else {
      reverse = '';
      currency = this.homeCurrency;
      netWorkNames = `${this.web3Store.homeNet.name} - ${this.web3Store.foreignNet.name}`;
    }
    return(
      <div className="bridge">
        <div className="bridge-network bridge-network_left">
          <h1 className="bridge-network-name-container">
            <img src={poa} width="50" height="50" alt="POA"/>
            <div className="bridge-network-name">
              Home: {this.web3Store.homeNet.name}({this.web3Store.homeNet.id})
            </div>
          </h1>
          <p className="label">WebSocket url</p>
          <p className="description">{this.web3Store.HOME_WEB_SOCKETS_PARITY_URL}</p>
          <p className="label">Home address</p>
          <p className="description break-all">{this.homeStore.HOME_BRIDGE_ADDRESS}</p>
          <p className="label">Current Deposit limit</p>
          <p className="description break-all">{this.homeStore.maxCurrentDeposit} {this.homeCurrency}</p>
          <p className="label">Maximum Amount Per Transaction limit</p>
          <p className="description break-all">{this.homeStore.maxPerTx} {this.homeCurrency}</p>
          <p className="label">Total Contract Balance</p>
          <p className="description break-all">{this.homeStore.balance} {this.homeCurrency}</p>
          <p className="label">Your {this.homeCurrency} Balance</p>
          <p className="description break-all">{this.web3Store.defaultAccount.homeBalance}</p>
        </div>
        <form className="bridge-form">
          <div className="bridge-form-controls">
            <input ref="amount" type="text" className="bridge-form-input" id="amount" placeholder="0.345" />
            <Fade in={this.state.reverse}>
              <label htmlFor="amount" className="bridge-form-label">{currency}</label>
            </Fade> 
            <button onClick={this.onTransfer} type="button" className={`bridge-form-button ${reverse}`}></button>
          </div>
          <div className="bridge-form-footer">
            <Fade in={this.state.reverse}>
              <p>{netWorkNames}</p>
             </Fade> 
            <button onClick={this.onSwitch}>Switch</button>
          </div>
        </form>
        <div className="bridge-network bridge-network_right">
          <h1 className="bridge-network-name-container">
            <img src={eth} width="50" height="50" alt="ETH" />
            <span className="bridge-network-name">
              Foreign: {this.web3Store.foreignNet.name}({this.web3Store.foreignNet.id})
            </span>
          </h1>
          <p className="label">Websocket url</p>
          <p className="description">{this.web3Store.FOREGIGN_WEB_SOCKETS_PARITY_URL}</p>
          <p className="label">Foreign address</p>
          <p className="description break-all">{this.foreignStore.FOREIGN_BRIDGE_ADDRESS}</p>
          <p className="label">Current Withdraw limit</p>
          <p className="description break-all">{this.foreignStore.maxCurrentDeposit} {this.foreignStore.symbol}</p>
          <p className="label">Maximum Amount Per Transaction limit</p>
          <p className="description break-all">{this.foreignStore.maxPerTx} {this.foreignStore.symbol}</p>
          <p className="label">Total Supply</p>
          <p className="description break-all">{this.foreignStore.totalSupply} {this.foreignStore.symbol}</p>
          <p className="label">Your {this.foreignStore.symbol} Balance</p>
          <p className="description break-all">{this.foreignStore.balance}</p>
        </div>
      </div>
    );
  }
}
