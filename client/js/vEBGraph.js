import React from 'react';
import { connect } from 'react-redux';
import * as d3 from "d3";
import Node from './vEBNode';
import {store} from './main.js';
const NODE_RADIUS = 10;
import {ADD_POINT, INSERT_NODE, SET_ROOT, CLEAR_POINTS} from './constants';

function vEBReducer (state, action) {
  if (state === undefined) {
    return {root: null,};
  }

  switch (action.type) {
    case SET_ROOT:
      return Object.assign({}, state, {
        root: action.root,
      });
    case INSERT_NODE:
      let newElement = isNaN(action.newElement) ? parseInt(action.newElement.split('').map(x => x.charCodeAt(0)).reduce(x, y) => x+y, '') : parseFloat(action.newElement);
      if (state.root === null) {
        return Object.assign({}, state, {
          root: new Node(newElement),
        });
      }
      state.root.insert(newElement);
    default:
      return state;
  }
}

class vEBGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.makevEBTree = this.makevEBTree.bind(this);
  }

  changeElement (event) {
    this.setState({newElement: event.target.value});
  }

  insertElement (event) {
    let newElement = this.state.newElement;

    event.preventDefault();
    store.dispatch({type: INSERT_NODE, newElement});
    this.setState({newElement: ''});
  }

  makevEBTree () {
    store.dispatch({type: CLEAR_POINTS});
    // figure out how this works TODO
  }

  render () {
    return (
      <div>
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
        </form>
        <button onClick={this.makeGeometricBST}>Make Geometric BST</button>
        <svg id="standard" className="graph">
          <g id="links"/>
          <g id="nodes"/>
        </svg>
      </div>
    );
  }

  componentDidMount () {
    // TODO
  }

  componentDidUpdate () {
    // TODO
  }
}

export default connect(function (state, ownProps) {
  return {root: state.vEBTree.root,};
})(vEBGraph);

export {vEBReducer};
