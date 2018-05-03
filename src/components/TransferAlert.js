import React from 'react'
import arrowsIcon from '../assets/images/icon-arrows@2x.png'

export const TransferAlert = ({
  onConfirmation,
  onCancel,
  from,
  to,
  fromCurrency,
  toCurrency,
  amount
  }) => {

  return (
    <div className="transfer-alert">
      <div className="image-container">
        <img className="arrows-icon" src={arrowsIcon} alt="transfer icon"/>
      </div>
      <div className="alert-container">
        <span className="transfer-title">Are you sure?</span>
        <p className="transfer-description">Please confirm that you would like to send {amount} {fromCurrency} from {from} to receive {amount} {toCurrency} on {to}.</p>
        <div className="transfer-buttons">
          <button className="transfer-confirm" onClick={onConfirmation}>Continue</button>
          <button className="transfer-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
