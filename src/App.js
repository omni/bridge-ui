import React from 'react';
import { Header, Bridge, RelayEvents, Footer, SweetAlert, Loading, StatusPage, StatisticsPage } from './components';
import { Route } from 'react-router-dom'
import './assets/stylesheets/application.css';
import { Disclaimer } from './components'
import { ModalContainer } from './components'
import { setItem, getItem, DISCLAIMER_KEY } from './components/utils/localstorage'

export class App extends React.Component {
  state = {
    showDisclaimer: false,
    showMobileMenu: false
  }

  componentDidMount() {
    const disclaimerDisplayed = getItem(DISCLAIMER_KEY)
    if(!disclaimerDisplayed) {
      this.setState({ showDisclaimer: true })
    }
  }

  closeDisclaimer = () => {
    setItem(DISCLAIMER_KEY, true)
    this.setState({showDisclaimer: false})
  }

  toggleMobileMenu = () => {
    this.setState(prevState => ({ showMobileMenu: !prevState.showMobileMenu}))
  }

  render() {
    const { showDisclaimer, showMobileMenu } = this.state
    return (
      <div>
        <Route render={() =>
          <Header
            showMobileMenu={showMobileMenu}
            onMenuToggle={this.toggleMobileMenu}
          />
        }/>
        <div className="app-container">
        </div>
        <Route component={Footer}/>
        <ModalContainer showModal>
          <Disclaimer
            onConfirmation={this.closeDisclaimer} />
        </ModalContainer>
      </div>
    )
  }
}
