import React, { Component } from 'react';
import { Header, Bridge, Events, Footer } from './components';
import { Route } from 'react-router'
import './assets/stylesheets/application.css';

export const App = () => {
  return (
    <div>
      <Route component={Header}/>
      <div className="container">
        <Route exact path="/" component={Bridge}/>
        <Route exact path="/" component={Events}/>
      </div>
      <Route component={Footer}/>
    </div>
  );
};
