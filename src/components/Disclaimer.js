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
            However, you can swap POA or POA20 for STAKE tokens.
            <br/>
            <br/>
            See the instructions:
            <ul>
            <li><a href="https://www.poa.network/how-to-swap">Swap POA</a></li>
            <li><a href="https://www.poa.network/poa20-swap">Swap POA20 on Ethereum</a></li>
            </ul>
          </p>
        </div>
      </div>
  )}
}
