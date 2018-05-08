import React from 'react';
import { Header, Bridge, RelayEvents, Footer, SweetAlert, Loading, StatusPage } from './components';
import { Route } from 'react-router-dom'
import './assets/stylesheets/application.css';
import { Disclaimer } from './components'
import { ModalContainer } from './components'
import { setItem, getItem, DISCLAIMER_KEY } from './components/utils/localstorage'

export class App extends React.Component {
  state = {
    showDisclaimer: false
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

  render() {
    const { showDisclaimer } = this.state
    return (
      <div>
        <Route component={Loading}/>
        <Route component={SweetAlert}/>
        <Route component={Header}/>
        <div className="app-container">
          <Route exact path="/" component={Bridge}/>
          <Route exact path="/events" component={RelayEvents}/>
          <Route exact path="/status" component={StatusPage}/>
        </div>
        <Route component={Footer}/>
        <ModalContainer
          showModal={showDisclaimer}
        >
          <Disclaimer
            onConfirmation={this.closeDisclaimer} />
        </ModalContainer>
      </div>
    )
  }
}
