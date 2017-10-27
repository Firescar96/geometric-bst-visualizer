import Home from './Home.js';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { standardBSTReducer } from './StandardBSTGraph';
import { combineReducers } from 'redux';

let store = createStore(standardBSTReducer);

render((
  <Provider store={store}>
    <BrowserRouter>
      <Route path="*" component={Home}/>
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));
