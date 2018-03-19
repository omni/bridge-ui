import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { HashRouter } from 'react-router-dom'
import { Provider } from "mobx-react";
import RootStore from './stores/RootStore';

ReactDOM.render((
  <Provider RootStore={RootStore}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
), document.getElementById('root'));
