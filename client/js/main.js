import Home from './Home.js';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { standardBSTReducer } from './StandardBSTGraph';
import { geometricBSTReducer } from './GeometricBSTGraph';

let store = createStore(combineReducers({
  standardBST: standardBSTReducer,
  geometricBST: geometricBSTReducer,
}));
export {store}; //exported here so it's available in all the subcompnents

render((
  <Provider store={store}>
    <BrowserRouter>
      <Route path="*" component={Home}/>
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));
