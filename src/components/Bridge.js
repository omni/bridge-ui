import React from 'react';
import poa from '../assets/images/poa@2x.png';
import eth from '../assets/images/eth@2x.png';

export const Bridge = () => (
  <div className="bridge">
    <div className="bridge-network bridge-network_left">
      <h1 className="bridge-network-name-container">
        <img src={poa} width="50" height="50" />
        <div className="bridge-network-name">
          Poa network
        </div>
      </h1>
      <p className="label">Rpc url</p>
      <p className="description">ws:localhost:8541</p>
      <p className="label">Home address</p>
      <p className="description break-all">0x513efa14a9f526205b8683aa2129772c77c9112</p>
      <p className="label">Balance</p>
      <p className="description break-all">1,093,394.0232</p>
    </div>
    <form className="bridge-form">
      <div className="bridge-form-controls">
        <input type="text" className="bridge-form-input" id="amount" placeholder="0.345" />
        <label htmlFor="amount" className="bridge-form-label">Eth</label>
        <button type="button" className="bridge-form-button"></button>
      </div>
      <div className="bridge-form-footer">
        <p>POA Network - Ethereum Network</p>
        <a href="#">Switch</a>
      </div>
    </form>
    <div className="bridge-network bridge-network_right">
      <h1 className="bridge-network-name-container">
        <img src={eth} width="50" height="50" />
        <span className="bridge-network-name">
          Ethereum network (kovan)
        </span>
      </h1>
      <p className="label">Rpc url</p>
      <p className="description">ws:localhost:8541</p>
      <p className="label">Home address</p>
      <p className="description break-all">0x513efa14a9f526205b8683aa2129772c77c9112</p>
      <p className="label">Balance</p>
      <p className="description break-all">1,093,394.0232</p>
    </div>
  </div>
);
