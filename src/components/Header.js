import React from 'react';
import { Link } from  'react-router-dom'
import logo from '../assets/images/logos/logo-top@2x.png'
import menuIcon from '../assets/images/icons/icon-menu.svg'
import menuOpenIcon from '../assets/images/icons/icon-close.svg'
import { Wallet } from './Wallet'

const getMobileMenuLinks = (onMenuToggle) =>
  (<div className="links_container_mobile">
    <Link to='/events' className="link" onClick={onMenuToggle}>
      <i className="icon_events" /><span className='link_text'>Events</span>
    </Link>
    <Link to='/status' className="link" onClick={onMenuToggle}>
      <i className="icon_status" /><span className='link_text'>Status</span>
    </Link>
    <Link to='/statistics' className="link" onClick={onMenuToggle}>
      <i className="icon_statistics" /><span className='link_text'>Statistics</span>
    </Link>
  </div>)


export const Header = ({ showMobileMenu, onMenuToggle }) => (
  <header className="header">
    {showMobileMenu && (<div className="header-mobile-menu-container">{getMobileMenuLinks(onMenuToggle)}</div>)}
    <div className="container">
      <Link to="/" onClick={showMobileMenu ? onMenuToggle : null}><img className="header-logo" src={logo} alt=""/></Link>
      <div className="links_container">
        <Link to='/events' className="link">
          <i className="icon_events" /><span className='link_text'>Events</span>
        </Link>
        <Link to='/status' className="link">
          <i className="icon_status" /><span className='link_text'>Status</span>
        </Link>
        <Link to='/statistics' className="link">
          <i className="icon_statistics" /><span className='link_text'>Statistics</span>
        </Link>
        <Wallet />
      </div>
      <div className="mobile-menu">
        <img onClick={onMenuToggle} className={showMobileMenu ? 'mobile-menu-open-icon' : 'mobile-menu-icon'} src={showMobileMenu ? menuOpenIcon : menuIcon} alt=""/>
      </div>
    </div>
  </header>
);
