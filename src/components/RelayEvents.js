import React from 'react';
import { inject, observer } from "mobx-react";
import DepositWithdraw from './events/DepositWithdraw';
import SignedForDeposit from './events/SignedForDeposit';
import CollectedSignatures from './events/CollectedSignatures';


const WAIT_INTERVAL = 700;
const ENTER_KEY = 13;

@inject("RootStore")
@observer
export class RelayEvents extends React.Component {
  constructor(props){
    super(props)
    this.homeStore = this.props.RootStore.homeStore;
    this.foreignStore = this.props.RootStore.foreignStore;
    this.alertStore = this.props.RootStore.alertStore;
    this.web3Store = this.props.RootStore.web3Store;
    this.handleChangeHome = this.handleChangeHome.bind(this)
    this.handleChangeForeign = this.handleChangeForeign.bind(this)
    this.handleKeyDownHome = this.handleKeyDownHome.bind(this)
    this.handleKeyDownForeign = this.handleKeyDownForeign.bind(this)
    this.timer = null;
  }

  async onHomeBlockFilter(value){
    this.alertStore.setLoading(true)
    if(value.substr(0,2) === "0x"){
      this.homeStore.toggleFilter()
      this.foreignStore.toggleFilter()
      await this.homeStore.filterByTxHash(value)
    } else {
      if(Number(value) > 0){
        await this.homeStore.setBlockFilter(value)
      } else {
        this.foreignStore.setBlockFilter(0)
        this.homeStore.setBlockFilter(0)
        this.homeStore.toggleFilter()
        this.foreignStore.toggleFilter()
      }
    }
    this.alertStore.setLoading(false)
  }

 async onForeignBlockFilter(value){
    this.alertStore.setLoading(true)
    if(value.substr(0,2) === "0x"){
      this.homeStore.toggleFilter()
      this.foreignStore.toggleFilter()
      await this.foreignStore.filterByTxHash(value)
    } else {
      if(Number(value) > 0){
        await this.foreignStore.setBlockFilter(value)
      } else {
        this.foreignStore.setBlockFilter(0)
        this.homeStore.setBlockFilter(0)
        this.homeStore.toggleFilter()
        this.foreignStore.toggleFilter()
      }
    }
    this.alertStore.setLoading(false)
  }

  async handleChangeHome(e) {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    this.timer = setTimeout(() => {this.onHomeBlockFilter(value)}, WAIT_INTERVAL);
  }

  async handleChangeForeign(e) {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    this.timer = setTimeout(() => {this.onForeignBlockFilter(value)}, WAIT_INTERVAL);
  }

  handleKeyDownHome(e) {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    if (e.keyCode === ENTER_KEY && value) {
        this.onHomeBlockFilter(value);
    }
  }

  handleKeyDownForeign(e) {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    if (e.keyCode === ENTER_KEY && value) {
        this.onForeignBlockFilter(value);
    }
  }

  render(){
    const home = [];
    this.homeStore.events.slice().forEach(({event, transactionHash, blockNumber, returnValues}, index) => {
      home.push(
        <DepositWithdraw
          home={true}
          eventName={event}
          transactionHash={transactionHash}
          blockNumber={blockNumber}
          recipient={returnValues.recipient}
          value={returnValues.value}
          homeTxHash={returnValues.transactionHash}
          filter={this.homeStore.filter || this.foreignStore.filter}
          key={index}/>)
    })
    const foreign = [];
    this.foreignStore.events.slice().forEach(({
      event,
      transactionHash,
      signedTxHash,
      blockNumber,
      returnValues}, index) => {
      if(event === 'Deposit' || event === 'Withdraw'){
        const currency = event === 'Deposit' ? 'POA': this.foreignStore.symbol
        foreign.push(
          <DepositWithdraw
            eventName={event}
            transactionHash={transactionHash}
            blockNumber={blockNumber}
            recipient={returnValues.recipient}
            value={returnValues.value}
            homeTxHash={returnValues.transactionHash}
            filter={this.homeStore.filter || this.foreignStore.filter}
            currency={currency}
            key={index}/>)
      }
      if(event === "SignedForDeposit" || event === "SignedForWithdraw") {
        foreign.push(
          <SignedForDeposit eventName={event} blockNumber={blockNumber} message={returnValues.messageHash} signer={returnValues.signer} key={index} transactionHash={transactionHash} filter={this.homeStore.filter || this.foreignStore.filter} signedTxHash={signedTxHash || returnValues.transactionHash}/>
        )
      }
      if( event === "CollectedSignatures"){
        foreign.push(
          <CollectedSignatures blockNumber={blockNumber} authorityResponsibleForRelay={returnValues.authorityResponsibleForRelay} messageHash={returnValues.messageHash} key={index} transactionHash={transactionHash} filter={this.homeStore.filter || this.foreignStore.filter} signedTxHash={signedTxHash || returnValues.transactionHash}/>
        )
      }
    })
    return(
      <div className="events-container">
        <h1 className="events-title">Events</h1>
        <div className="events">
          <div className="events-side events-side_left">
            <h1 className="events-title events-title_mobile">Home: {this.web3Store.homeNet.name}({this.web3Store.homeNet.id})</h1>
            <input type="text" onChange={this.handleChangeHome} onKeyDown={this.handleKeyDownHome} className="events-side-input" placeholder="Tx Hash or Block Number..." />
            {home}
          </div>
          <div className="events-side events-side_right">
            <h1 className="events-title events-title_mobile">Foreign: {this.web3Store.foreignNet.name}({this.web3Store.foreignNet.id})</h1>
            <input type="text" onChange={this.onForeignBlockFilter} onKeyDown={this.handleKeyDownForeign} className="events-side-input" placeholder="Tx Hash or Block Number ..." />
            {foreign}
          </div>
        </div>
      </div>
    );
  }
}
