import React from 'react'
import Web3Utils from 'web3-utils'
import numeral from 'numeral'

export const Event = ({ color, eventName, transactionHash, recipient, value, blockNumber, txUrl, accountUrl }) => (
  <div>
    <div className="event">
      <div className="event-tx-container txhash-column">
        <span className={`event-name background-${color}`}>{eventName}</span>
        <a href={txUrl+transactionHash} target="_blank" className="event-txhash">{transactionHash.slice(0,24).concat('...')}</a>
      </div>
      <a href={accountUrl+recipient} target="_blank" className="event-recipient recipient-column">
        {recipient ? <strong className="only-mobile event-recipient-label ">Recipient</strong> : ''}
        {recipient ? recipient.slice(0,27).concat('...') : ''}
      </a>
      <span className="event-value value-column">
        {recipient ? <strong className="only-mobile">Value</strong> : ''}
        {value ? numeral(Web3Utils.fromWei(value)).format('0,0.00', Math.floor) : ''}
      </span>
      <span className="event-block block-column"><strong className="only-mobile">Block</strong>{blockNumber}</span>
    </div>
    <div className="event-separator" />
  </div>

)
