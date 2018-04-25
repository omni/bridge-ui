import React from 'react'
import walletIcon from '../assets/images/icons/icon-wallet.svg'

export const BridgeAddress = ({ isHome, logo, address}) => {
  const getAddress = () => isHome ?
    (<div className="home-address-container">
      <img className="icon-wallet" src={walletIcon} alt="wallet icon"/>
      <div>
        <p className="address-label">Home Address</p>
        <p className="address-description">{address}</p>
      </div>
    </div>)
    :
    (<div className="foreign-address-container">
      <div>
        <p className="address-label">Home Address</p>
        <p className="address-description">{address}</p>
      </div>
      <img className="icon-wallet" src={walletIcon} alt="wallet icon"/>
    </div>)

  return isHome ?
    (<div className="bridge-home">
      <div className="bridge-home-container">
        <div className="home-logo-container">
          <img className="home-logo" src={logo} alt="home logo"/>
        </div>
      </div>
      {getAddress()}
    </div>)
    :
    (<div className="bridge-foreign">
      {getAddress()}
      <div className="bridge-foreign-container">
        <div className="foreign-logo-container">
          <img className="foreign-logo" src={logo} alt="foreign logo"/>
        </div>
      </div>
    </div>)
}
