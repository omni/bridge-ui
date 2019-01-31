import React from 'react'
import arrowsIcon from '../assets/images/icon-arrows@2x.png'
import arrowIconRight from '../assets/images/icons/icon-arrow-right.svg'
import numeral from 'numeral'



export const TransferAlert = ({
  onConfirmation,
  onCancel,
  from,
  to,
  fromLogo,
  toLogo,
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  fee,
  reverse
  }) => {

  const formattedFromAmount = numeral(fromAmount).format('0,0[.][000000000000000000]', Math.floor)
  const formattedToAmount = numeral(toAmount).format('0,0[.][000000000000000000]', Math.floor)

  return (
    <div className="transfer-alert">
      <div className="image-container">
        <img className="arrows-icon" src={arrowsIcon} alt="transfer icon"/>
      </div>
      <div className="alert-container">
        <div className="transfer-title">
          <div className="alert-logo-box">
            <div className={reverse ? 'alert-foreign-logo' : 'alert-home-logo'}
                 style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}
            >
              {fromCurrency}
            </div>
          </div>
          <div><strong>{formattedFromAmount}</strong> {fromCurrency}</div>
          <img className="icon_arrow_right" src={arrowIconRight} alt="arrow right"/>
          <div><strong>{formattedToAmount}</strong> {toCurrency}</div>
          <div className="alert-logo-box">
            <div className={reverse ? 'alert-home-logo' : 'alert-foreign-logo'}
                 style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}
            >
              {toCurrency}
            </div>
          </div>
        </div>
        <p className="transfer-description">
          <strong>{fee && `Fee: ${fee.toString()}%`}</strong>
          <br />
          Please confirm that you would like to send <strong>{formattedFromAmount}</strong> {fromCurrency} from {from} to receive <strong>{formattedToAmount}</strong> {toCurrency} on {to}.
        </p>
        <div className="transfer-buttons">
          <button className="transfer-confirm" onClick={onConfirmation}>Continue</button>
          <button className="transfer-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
