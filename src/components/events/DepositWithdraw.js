import React from 'react';
import Web3Utils from 'web3-utils'
export default class Event extends React.Component{
  constructor(props) {
    super(props)
    this.onClick  = this.onClick.bind(this)
    this.state = {
      show: false
    }
  }
  onClick(e) {
    this.setState({show: !this.state.show});
  }
  render(){
    let {eventName, transactionHash, recipient, value, blockNumber, homeTxHash, currency} = this.props;
    value = Web3Utils.fromWei(value)
    const color = eventName === 'Deposit' ? 'green' : 'red'
    const open = this.state.show ? 'events-i_open' : ''
    let homeTxInfo, style;
    if(homeTxHash && this.state.show){
      homeTxInfo = (
        <div>
          <p className="label">Home Tx Hash</p>
          <p className="description">
            {homeTxHash}
          </p>
        </div>
      )
      style = {height: '19.5em'}
    }
    return (
    <div className={`events-i ${open}`}>
      <div className="events-i-header">
        <div className="events-i-header-title">
          <p className={`label ${color}`}>{eventName}</p>
          <a href="#">Show Сouple</a>
        </div>
        <p className="description break-all">
          tx: {transactionHash}
        </p>
      <div onClick={this.onClick} className="events-i-switcher"></div>
      </div>
        <div className="events-i-body" style={style}>
          <p className="label">Recepient</p>
          <p className="description break-all">
            {recipient}
          </p>
          <p className="label">Recepient value</p>
          <p className="description break-all">
            {value} {currency}
          </p>
          <p className="label">Block number</p>
          <p className="description">
            {blockNumber}
          </p>
          {homeTxInfo}
        </div>
    </div>
    )}
  }