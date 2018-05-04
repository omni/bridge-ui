import React from 'react'
import Web3Utils from 'web3-utils'
import numeral from 'numeral'

export const Event = ({ color, eventName, transactionHash, recipient, value, blockNumber }) => (
  <div>
    <div className="event">
      <div className="event-tx-container txhash-column"><span className={`event-name background-${color}`}>{eventName}</span><span className="event-txhash">{transactionHash.slice(0,24).concat('...')}</span></div>
      <span className="event-recipient recipient-column">{recipient ? recipient.slice(0,27).concat('...') : ''}</span>
      <span className="event-value value-column">{value ? numeral(Web3Utils.fromWei(value)).format('0,0.00', Math.floor) : ''}</span>
      <span className="event-block block-column">{blockNumber}</span>
    </div>
    <div className="event-separator" />
  </div>

)
