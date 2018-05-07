import React from 'react';
import { inject, observer } from "mobx-react";
import { EventsListHeader } from './index'
import { Event } from './index'
import { getExplorerUrl } from '../stores/utils/web3'


const WAIT_INTERVAL = 700;
const ENTER_KEY = 13;

@inject("RootStore")
@observer
export class RelayEvents extends React.Component {
  constructor(props){
    super(props)
    this.timer = null;
    this.colors = {
      'Deposit': 'green',
      'Withdraw': 'red',
      'SignedForDeposit': 'purple',
      'SignedForWithdraw': 'purple',
      'CollectedSignatures': 'blue'
    }
    this.homeValue = '0'
    this.foreingValue = '1'
    this.state = {
      selectedList: '1'
    }
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

  getHomeEvents = (homeStore) => {
    return homeStore.events.slice().map(({event, transactionHash, blockNumber, returnValues}, index) =>
      ({
        color: this.colors[event],
        eventName: event,
        transactionHash,
        recipient: returnValues.recipient,
        value: returnValues.value,
        blockNumber
      }))
  }

  getForeignEvents = (foreignStore) => {
    return foreignStore.events.slice()
      .map(({ event, transactionHash, signedTxHash, blockNumber, returnValues}) => {
        return ({
          color: this.colors[event],
          eventName: event,
          transactionHash,
          recipient: returnValues.recipient,
          value: returnValues.value,
          blockNumber
        })
      })
  }

  onChangeList = (e) => {
    console.log( e.target.value)
    this.setState({selectedList: e.target.value})
  }

  render(){
    const { homeStore, foreignStore, web3Store } = this.props.RootStore
    const { selectedList } = this.state
    console.log('selectedList', selectedList, this.homeValue, this.foreingValue)
    const home = this.getHomeEvents(homeStore, foreignStore)
    const foreign = this.getForeignEvents(foreignStore, homeStore)

    return(
      <div className="events-page">
        <div className="events-container">
          <EventsListHeader
            onChangeList={this.onChangeList}
            selected={selectedList}
            homeName={'POA ' + web3Store.homeNet.name}
            homeValue={this.homeValue}
            foreignName={'ETH ' + web3Store.foreignNet.name}
            foreignValue={this.foreingValue} />
          {selectedList === this.homeValue
            && home.map(event =>
            <Event
              txUrl={getExplorerUrl(web3Store.homeNet.id) + 'tx/'}
              accountUrl={getExplorerUrl(web3Store.homeNet.id) + 'account/'}
              key={event.transactionHash}
              {...event} />)}
          {selectedList === this.foreingValue
            && foreign.map(event =>
            <Event
              txUrl={getExplorerUrl(web3Store.foreignNet.id) + 'tx/'}
              accountUrl={getExplorerUrl(web3Store.foreignNet.id) + 'address/'}
              key={event.transactionHash+event.eventName}
              {...event} />)}
        </div>
      </div>
    );
  }
}
