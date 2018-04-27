import React from 'react'
import walletIcon from '../assets/images/icons/icon-wallet.svg'

export const BridgeAddress = ({ isHome, logo}) => {
  const getAddress = () => isHome ?
    (<div className="home-address-container" />)
    :
    (<div className="foreign-address-container" />)

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
