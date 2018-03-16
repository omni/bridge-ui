import React from 'react';
import { Header, Bridge, Events, Footer, SweetAlert } from './components';
import { Route } from 'react-router'
import './assets/stylesheets/application.css';
import swal from 'sweetalert';
import { inject, observer } from "mobx-react";

export const App = () => {
  return (
    <div>
      <Route component={Header}/>
      <div className="container">
        <Route exact path="/" component={Bridge}/>
        <Route exact path="/" component={Events}/>
        <Route component={SweetAlert}/>
      </div>
      <Route component={Footer}/>
    </div>
  );
};
