import React from 'react';
import { EventHeader } from './EventHeader'

export default class SignedForDeposit extends React.Component{
  constructor(props) {
    super(props)
    this.onClick  = this.onClick.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onClick() {
    this.setState({show: !this.state.show});
  }
  render(){
    let { blockNumber, message, signer, transactionHash, eventName, signedTxHash } = this.props;
    const color = 'purple'
    const open = this.state.show ? 'events-i_open' : ''
    let style
    if(this.state.show){
      style = {height: '21.5em'}
    }
    return (
    <div className={`events-i ${open}`}>
      <EventHeader
        color={color}
        eventName={eventName}
        transactionHash={transactionHash}
        handleClick={this.onClick}
      />
      <div className="events-i-body" style={style}>
        <p className="label">Message</p>
        <p className="description break-all">
          {message}
        </p>
        <p className="label">Signer</p>
        <p className="description break-all">
          {signer}
        </p>
        <p className="label">Block number</p>
        <p className="description">
          {blockNumber}
        </p>
        <p className="label">Signed Tx Hash</p>
        <p className="description">
          {signedTxHash}
        </p>
      </div>
    </div>
    )}
  }
