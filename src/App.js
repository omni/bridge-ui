import React from 'react';
import { Header, Bridge, RelayEvents, Footer, SweetAlert, Loading } from './components';
import { Route } from 'react-router-dom'
import './assets/stylesheets/application.css';
export const App = () => {
  return (
    <div>
      <Route component={Loading}/>
      <Route component={SweetAlert}/>
      <Route component={Header}/>
      <div className="bridge-container">
        <Route exact path="/" component={Bridge}/>
        <Route exact path="/events" component={RelayEvents}/>
      </div>
      <Route component={Footer}/>
    </div>
  );
};
