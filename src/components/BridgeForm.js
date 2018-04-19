import React from 'react'
import { Fade } from './index'

export const BridgeForm = ({ reverse, currency, homeNetName, foreignNetName, onSwitch, onTransfer, onInputChange}) => (
  <form className="bridge-form">
    <div className="bridge-form-controls">
      <input onChange={onInputChange} name='amount' type="text" className="bridge-form-input" id="amount" placeholder="0.345" />
      <Fade in={reverse}>
        <label htmlFor="amount" className="bridge-form-label">{currency}</label>
      </Fade>
      <button onClick={onTransfer} type="button" className={`bridge-form-button ${reverse ? 'bridge-form-button_reverse' : ''}`} />
    </div>
    <div className="bridge-form-footer">
      <Fade in={reverse}>
        <p>{homeNetName} {reverse ? String.fromCharCode(8592) : String.fromCharCode(8594)} {foreignNetName}</p>
      </Fade>
      <button onClick={onSwitch}>Switch</button>
    </div>
  </form>
)
