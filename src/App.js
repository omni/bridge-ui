import React from 'react';
import { Header, Bridge, RelayEvents, Footer, SweetAlert } from './components';
import { Route } from 'react-router'
import './assets/stylesheets/application.css';

export const App = () => {
  return (
    <div>
      <Route component={SweetAlert}/>
      <Route component={Header}/>
      <div className="container">
        <Route exact path="/" component={Bridge}/>
        <Route exact path="/" component={RelayEvents}/>
      </div>
      <Route component={Footer}/>
    </div>
  );
};
