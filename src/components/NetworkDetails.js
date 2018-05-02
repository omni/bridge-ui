import React from 'react'
import copyIcon from '../assets/images/icons/copy.svg'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import numeral from 'numeral'

export const NetworkDetails = ({
  isHome,
  networkData,
  url,
  logo,
  address,
  currency,
  tokenAddress,
  maxCurrentLimit,
  maxPerTx,
  minPerTx,
  totalBalance,
  balance
 }) => {
  const networkTitle = isHome ? 'Home' : 'Foreign'
  const action = isHome ? 'Deposit' : 'Withdraw'
  const logoClass = isHome ? 'home-logo' : 'foreign-logo'

  return (
    <div className="network-details">
        <div className="details-logo-container">
          <img className={logoClass} src={logo} alt="home logo"/>
      </div>
      <div className="details-body">
        <p className="details-data-container">
          <span className="details-label">RPC Url</span>
          <span className="details-description">{url}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">{networkTitle} Address</span>
          <CopyToClipboard text={address}>
            <span className="details-description details-copy">
              {address.slice(0,27).concat('...')}
              <img className="info-icon-right" src={copyIcon} alt=""/>
            </span>
          </CopyToClipboard>
        </p>
        <p className="details-data-container">
          <span className="details-label">Current {action} Limit</span>
          <span className="details-description-bold">{maxCurrentLimit} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Maximum Amount Per Transaction Limit</span>
          <span className="details-description-bold">{maxPerTx} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Minimum Amount Per Transaction</span>
          <span className="details-description-bold">{minPerTx} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Total Contract Balance</span>
          <span className="details-description-bold">{numeral(totalBalance).format('0.00')} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Your {currency} Balance</span>
          <span className="details-description-bold">{numeral(balance).format('0.00')} {currency}</span>
        </p>
      </div>
    </div>
  )
}
