import React, { Component } from 'react';
import { Header, Bridge, Events, Footer } from './components';

import './assets/stylesheets/application.css';

export const App = () => {
  return (
    <div>
      <Header/>
      <div className="container">
        <Bridge/>
        <Events/>
      </div>
      <Footer/>
    </div>
  );
};
