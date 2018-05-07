import React from 'react'

export const BridgeAddress = ({ isHome, reverse, logo}) => {
  const getAddress = () => isHome ?
    (<div className="home-address-container" />)
    :
    (<div className="foreign-address-container" />)

  return isHome ?
    (<div className="bridge-home">
      <div className="bridge-home-container">
        <div className="home-logo-container">
          <img className={reverse ? 'foreign-logo' : 'home-logo'} src={logo} alt="home logo"/>
        </div>
      </div>
      {getAddress()}
    </div>)
    :
    (<div className="bridge-foreign">
      {getAddress()}
      <div className="bridge-foreign-container">
        <div className="foreign-logo-container">
          <img className={reverse ? 'home-logo' : 'foreign-logo'} src={logo} alt="foreign logo"/>
        </div>
      </div>
    </div>)
}
