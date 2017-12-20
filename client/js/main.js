import BST from './BST.js';
import XFastGraph from './XFastGraph';
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

//sorts numbers and strings in a way that makes sense, instead of the way
//javascript does it
let lessThanComparator = (a, b) => {
  if(!isNaN(a) && isNaN(b)) {
    //a is a number b is a string
    return true;
  }else if(isNaN(a) && !isNaN(b)) {
    //a is a string b is a number
    return false;
  }else if(!isNaN(a) && !isNaN(b)) {
    //both a and b are numbers
    return a < b;
  }

  //both a and b are strings
  return a.localeCompare(b) < 0;
};
export {lessThanComparator};

render((
  <Provider store={store}>
    <HashRouter>
      <div>
        <Navbar />
        <Route exact path="/" component={BST}/>
        <Route path="/veb" component={XFastGraph}/>
      </div>
    </HashRouter>
  </Provider>
), document.getElementById('root'));
