import React from 'react'
import poa from '../assets/images/poa@2x.png';
import eth from '../assets/images/eth@2x.png';

export const BridgeNetwork = ({
  isHome,
  networkData,
  url,
  address,
  currency,
  tokenAddress,
  maxCurrentLimit,
  maxPerTx,
  minPerTx,
  totalBalance,
  balance
}) => {
  const imgSrc = isHome ? poa : eth
  const imgAlt = isHome ? 'POA' : 'ETH'
  const networkTitle = isHome ? 'Home' : 'Foreign'
  const side = isHome ? 'bridge-network_left' : 'bridge-network_right'
  const action = isHome ? 'Deposit' : 'Withdraw'
  const balanceType = isHome ? 'Contract Balance' : 'Supply'

  return (
   <div className={`bridge-network ${side}`}>
     <h1 className="bridge-network-name-container">
       <img src={imgSrc} width="50" height="50" alt={imgAlt}/>
       <div className="bridge-network-name">
         {networkTitle}: {networkData.name}({networkData.id})
       </div>
     </h1>
     <p className="label">RPC url</p>
     <p className="description">{url}</p>
     <p className="label">{networkTitle} address</p>
     <p className="description break-all">{address}</p>
     {!isHome && <p className="label">Token address</p>}
     {!isHome && <p className="description break-all">{tokenAddress}</p>}
     <p className="label">Current {action} limit</p>
     <p className="description break-all">{maxCurrentLimit} {currency}</p>
     <p className="label">Maximum Amount Per Transaction limit</p>
     <p className="description break-all">{maxPerTx} {currency}</p>
     <p className="label">Minimum Amount Per Transaction</p>
     <p className="description break-all">{minPerTx} {currency}</p>
     <p className="label">Total {balanceType}</p>
     <p className="description break-all">{totalBalance} {currency}</p>
     <p className="label">Your {currency} Balance</p>
     <p className="description break-all">{balance}</p>
   </div>
 )
}
