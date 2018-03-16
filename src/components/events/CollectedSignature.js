import React from 'react';

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
    const {eventName, transactionHash, recipient, value, blockNumber, homeTxHash} = this.props;
    const color = 'purple'
    const open = this.state.show ? 'events-i_open' : ''
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
        <div className="events-i-body">
          <p className="label">Recepient</p>
          <p className="description break-all">
            {recipient}
          </p>
          <p className="label">Recepient value</p>
          <p className="description break-all">
            {value}
          </p>
          <p className="label">Block number</p>
          <p className="description">
            {blockNumber}
            {homeTxHash}
          </p>
        </div>
    </div>
    )}
  }