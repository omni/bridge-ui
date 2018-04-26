import React from 'react'

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
          <p className="label">RPC Url</p>
          <p className="description">{url}</p>
          <p className="label">{networkTitle} Address</p>
          <p className="description break-all">{address}</p>
          <p className="label">Current {action} Limit</p>
          <p className="description break-all">{maxCurrentLimit} {currency}</p>
          <p className="label">Maximum Amount Per Transaction Limit</p>
          <p className="description break-all">{maxPerTx} {currency}</p>
          <p className="label">Minimum Amount Per Transaction</p>
          <p className="description break-all">{minPerTx} {currency}</p>
          <p className="label">Total Contract Balance</p>
          <p className="description break-all">{totalBalance} {currency}</p>
          <p className="label">Your {currency} Balance</p>
          <p className="description break-all">{balance}</p>
      </div>
    </div>
  )
}
