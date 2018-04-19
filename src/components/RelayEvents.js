import React from 'react';
import { inject, observer } from "mobx-react";
import DepositWithdraw from './events/DepositWithdraw';
import SignedForDeposit from './events/SignedForDeposit';
import CollectedSignatures from './events/CollectedSignatures';
import { EventList } from './index'


const WAIT_INTERVAL = 700;
const ENTER_KEY = 13;

@inject("RootStore")
@observer
export class RelayEvents extends React.Component {
  constructor(props){
    super(props)
    this.timer = null;
  }

  onHomeBlockFilter = async (value) => {
    const { alertStore, homeStore, foreignStore } = this.props.RootStore
    alertStore.setLoading(true)
    if(value.substr(0,2) === "0x"){
      homeStore.toggleFilter()
      foreignStore.toggleFilter()
      await homeStore.filterByTxHash(value)
    } else {
      if(Number(value) > 0){
        await homeStore.setBlockFilter(value)
      } else {
        foreignStore.setBlockFilter(0)
        homeStore.setBlockFilter(0)
        homeStore.toggleFilter()
        foreignStore.toggleFilter()
      }
    }
    alertStore.setLoading(false)
  }

  onForeignBlockFilter = async (value) => {
    const { alertStore, homeStore, foreignStore } = this.props.RootStore
    alertStore.setLoading(true)
    if(value.substr(0,2) === "0x"){
      homeStore.toggleFilter()
      foreignStore.toggleFilter()
      await foreignStore.filterByTxHash(value)
    } else {
      if(Number(value) > 0){
        await foreignStore.setBlockFilter(value)
      } else {
        foreignStore.setBlockFilter(0)
        homeStore.setBlockFilter(0)
        homeStore.toggleFilter()
        foreignStore.toggleFilter()
      }
    }
    alertStore.setLoading(false)
  }

  handleChangeHome = async (e) => {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    this.timer = setTimeout(() => {this.onHomeBlockFilter(value)}, WAIT_INTERVAL);
  }

  handleChangeForeign = async (e) => {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    this.timer = setTimeout(() => {this.onForeignBlockFilter(value)}, WAIT_INTERVAL);
  }

  handleKeyDownHome = (e) => {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    if (e.keyCode === ENTER_KEY && value) {
        this.onHomeBlockFilter(value);
    }
  }

  handleKeyDownForeign = (e) => {
    const value = e.target.value;
    window.clearTimeout(this.timer);
    if (e.keyCode === ENTER_KEY && value) {
        this.onForeignBlockFilter(value);
    }
  }

  getHomeEvents = (homeStore, foreignStore) => {
    return homeStore.events.slice().map(({event, transactionHash, blockNumber, returnValues}, index) =>
      <DepositWithdraw
        home={true}
        eventName={event}
        transactionHash={transactionHash}
        blockNumber={blockNumber}
        recipient={returnValues.recipient}
        value={returnValues.value}
        homeTxHash={returnValues.transactionHash}
        filter={homeStore.filter || foreignStore.filter}
        key={index} />)
  }

  getForeignEvents = (foreignStore, homeStore) => {
    return foreignStore.events.slice()
      .map(({ event, transactionHash, signedTxHash, blockNumber, returnValues}, index) => {
        if(event === 'Deposit' || event === 'Withdraw') {
          return (
            <DepositWithdraw
              eventName={event}
              transactionHash={transactionHash}
              blockNumber={blockNumber}
              recipient={returnValues.recipient}
              value={returnValues.value}
              homeTxHash={returnValues.transactionHash}
              filter={homeStore.filter || foreignStore.filter}
              currency={event === 'Deposit' ? 'POA': foreignStore.symbol}
              key={index}/>)
        }
        if(event === "SignedForDeposit" || event === "SignedForWithdraw") {
          return (
            <SignedForDeposit
              eventName={event}
              blockNumber={blockNumber}
              message={returnValues.messageHash}
              signer={returnValues.signer}
              key={index}
              transactionHash={transactionHash}
              filter={homeStore.filter || foreignStore.filter}
              signedTxHash={signedTxHash || returnValues.transactionHash}/>
          )
        }
        if(event === "CollectedSignatures") {
          return (
            <CollectedSignatures
              eventName={event}
              blockNumber={blockNumber}
              authorityResponsibleForRelay={returnValues.authorityResponsibleForRelay}
              messageHash={returnValues.messageHash}
              key={index}
              transactionHash={transactionHash}
              filter={homeStore.filter || foreignStore.filter}
              signedTxHash={signedTxHash || returnValues.transactionHash}/>
          )
        }
      })
  }

  render(){
    const { homeStore, foreignStore, web3Store } = this.props.RootStore

    const home = this.getHomeEvents(homeStore, foreignStore)
    const foreign = this.getForeignEvents(foreignStore, homeStore)

    const homeDescription = `Home: ${web3Store.homeNet.name}(${web3Store.homeNet.id})`
    const foreignDescription = `Foreign: ${web3Store.foreignNet.name}(${web3Store.foreignNet.id})`

    return(
      <div className="events-container">
        <h1 className="events-title">Events</h1>
        <div className="events">
          <div className="events-side events-side_left">
            <EventList
              events={home}
              description={homeDescription}
              handleChange={this.handleChangeHome}
              handleKeyDown={this.handleKeyDownHome} />
          </div>
          <div className="events-side events-side_right">
            <EventList
              events={foreign}
              description={foreignDescription}
              handleChange={this.handleChangeForeign}
              handleKeyDown={this.handleKeyDownForeign} />
          </div>
        </div>
      </div>
    );
  }
}
