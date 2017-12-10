import BST from './BST.js';
import VEBGraph from './VEBGraph';
import Navbar from './Navbar';
import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { standardBSTReducer } from './StandardBSTGraph';
import { geometricBSTReducer } from './GeometricBSTGraph';
require('../sass/global.scss');

let store = createStore(combineReducers({
  standardBST: standardBSTReducer,
  geometricBST: geometricBSTReducer,
}));
export {store}; //exported here so it's available in all the subcompnents

let lessThanComparator = (a, b) => {
  return (isNaN(a) && a.localeCompare(b) < 0 ) || (!isNaN(a) && isNaN(b)) || a < b;
};
export {lessThanComparator};

render((
  <Provider store={store}>
    <HashRouter>
      <div>
        <Navbar />
        <Route exact path="/" component={BST}/>
        <Route path="/veb" component={VEBGraph}/>
      </div>
    </HashRouter>
  </Provider>
), document.getElementById('root'));
