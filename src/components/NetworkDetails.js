import React from 'react'
import copyIcon from '../assets/images/icons/copy.svg'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import numeral from 'numeral'
import { getAddressUrl } from '../stores/utils/web3'

export const NetworkDetails = ({
  isHome,
  networkData,
  url,
  logo,
  address,
  currency,
  maxCurrentLimit,
  maxPerTx,
  minPerTx,
  tokenAddress,
  totalSupply,
  totalBalance,
  balance
 }) => {
  const networkTitle = isHome ? 'Bridge Home' : 'Bridge Foreign'
  const action = isHome ? 'POA' : 'POA20'
  const logoClass = isHome ? 'home-logo' : 'foreign-logo'
  const totalTitle = isHome ? 'Locked POA in Bridge Contract' : 'POA20 Tokens Amount'
  const totalAmount = isHome ? totalBalance : totalSupply
  const explorerPath = getAddressUrl(networkData.id)
  const formattedBalance = isNaN(numeral(balance).format('0.00', Math.floor))
    ? numeral(0).format('0,0.00', Math.floor)
    : numeral(balance).format('0,0.00', Math.floor)

  return (
    <div className="network-details">
        <div className="details-logo-container">
          <img className={logoClass} src={logo} alt="home logo"/>
      </div>
      <div className="details-body">
        <p className="details-data-container">
          <span className="details-label">Network</span>
          <span className="details-description">{url}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">{networkTitle} Address</span>
            <span className="details-description details-copy">
              <a className="details-description"  href={explorerPath+address} target="_blank" >
                {address.slice(0,27).concat('...')}
              </a>
              <CopyToClipboard text={address}>
                <img className="info-icon-right" src={copyIcon} alt=""/>
              </CopyToClipboard>
            </span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Remaining Daily {action} Quota</span>
          <span className="details-description-black">{numeral(maxCurrentLimit).format('0,0.0', Math.floor)} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Maximum Amount Per Transaction</span>
          <span className="details-description-black">{numeral(maxPerTx).format('0,0.0', Math.floor)} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Minimum Amount Per Transaction</span>
          <span className="details-description-black">{numeral(minPerTx).format('0,0.0', Math.floor)} {currency}</span>
        </p>
        {!isHome && (
          <p className="details-data-container">
            <span className="details-label">Token Address</span>
            <span className="details-description details-copy">
              <a className="details-description" href={explorerPath+tokenAddress} target="_blank" >
                {tokenAddress.slice(0,27).concat('...')}
              </a>
              <CopyToClipboard text={tokenAddress}>
                <img className="info-icon-right" src={copyIcon} alt=""/>
              </CopyToClipboard>
            </span>
          </p>
        )}
        <p className="details-data-container">
          <span className="details-label">{totalTitle}</span>
          <span className="details-description-black">{numeral(totalAmount).format('0,0.00', Math.floor)} {currency}</span>
        </p>
        <p className="details-data-container">
          <span className="details-label">Your {currency} Balance</span>
          <span className="details-description-black">
            <strong>{formattedBalance} {currency}</strong>
          </span>
        </p>
      </div>
    </div>
  )
}
