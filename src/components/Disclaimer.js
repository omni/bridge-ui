import React from 'react'
import disclaimerIcon from '../assets/images/disclaimer@2x.png'

export class Disclaimer extends React.Component {
  state = {
    readTerms: false
  }

  handleCheckboxChange = () => {
    this.setState((prevState) => ({
      readTerms: !prevState.readTerms
    }))
  }

  render() {
    const { onConfirmation } = this.props
    const { readTerms } = this.state
    return (
      <div className="disclaimer-alert">
        <div className="image-container">
          <img className="disclaimer-icon" src={disclaimerIcon} alt="disclaimer icon"/>
        </div>
        <div className="alert-container">
          <span className="disclaimer-title">Out of operations</span>
          <p className="disclaimer-description">
            The POA-POA20 bridge is no longer in operation.
            <br/>
            POA Network merged with the Gnosis Chain. <a href="https://www.poa.network/">More information</a> about the merger.
            Meanwhile, POA or POA20 swap to STAKE token has ended on May 5th 2022.
          </p>
        </div>
      </div>
  )}
}
