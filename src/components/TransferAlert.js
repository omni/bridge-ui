import React from 'react'
import arrowsIcon from '../assets/images/icon-arrows@2x.png'
import topCorner from '../assets/images/icons/corner-2.svg'
import bottomCorner from '../assets/images/icons/corner-1.svg'

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
        <img className="alert-corner" src={topCorner} alt="transfer icon"/>
        <span className="transfer-title">Are you sure?</span>
        <img className="alert-corner" src={bottomCorner} alt="transfer icon"/>
        <p className="transfer-description">Please confirm that you would like to send {amount} {fromCurrency} from {from} to receive {amount} {toCurrency} on {to}.</p>
        <div className="transfer-buttons">
          <button className="transfer-confirm" onClick={onConfirmation}>Continue</button>
          <button className="transfer-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
