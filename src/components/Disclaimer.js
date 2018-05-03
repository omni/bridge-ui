import React from 'react'
import disclaimerIcon from '../assets/images/disclaimer@2x.png'
import topCorner from '../assets/images/icons/corner-2.svg'
import bottomCorner from '../assets/images/icons/corner-1.svg'

export const Disclaimer = ({ onConfirmation }) => (
    <div className="disclaimer-alert">
      <div className="image-container">
        <img className="disclaimer-icon" src={disclaimerIcon} alt="disclaimer icon"/>
      </div>
      <div className="alert-container">
        <img className="alert-corner" src={topCorner} alt="transfer icon"/>
        <span className="disclaimer-title">Welcome to <br /> POA Bridge UI App</span>
        <img className="alert-corner" src={bottomCorner} alt="transfer icon"/>
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
        <div className="disclaimer-buttons">
          <button className="disclaimer-confirm" onClick={onConfirmation}>Continue</button>
        </div>
      </div>
    </div>
)
