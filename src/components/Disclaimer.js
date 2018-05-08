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
          <span className="disclaimer-title">Welcome to <br /> POA Bridge UI App</span>
          <p className="disclaimer-description">
            The software is in Beta stage. POA Bridge is constantly under
            active development. The “Beta” labelling implies that while the
            core features of the software have been implemented, bugs
            and issues may still remain undiscovered until this phase of
            testing is complete. As such, POA Bridge may experience the
            following issues, but not limited to, during usage: lost of
            tokens/funds from incorrect configuration; unexpected delays;
            unexpected visual artifacts.
          </p>
          <div>
            <input
              className="disclaimer-checkbox"
              name="readTerms"
              type="checkbox"
              checked={readTerms}
              onChange={this.handleCheckboxChange} />
            <label onClick={this.handleCheckboxChange} className="disclaimer-tos">
              I accept the <a href='#' className="disclaimer-link">Terms of Service</a>
            </label>
          </div>
          <div className="disclaimer-buttons">
            <button
              disabled={!this.state.readTerms}
              className={this.state.readTerms ? "disclaimer-confirm" : "disclaimer-confirm-disabled"}
              onClick={onConfirmation}>
              Continue
            </button>
          </div>
        </div>
      </div>
  )}
}
