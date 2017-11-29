import React from 'react';
import { connect } from 'react-redux';
import StandardBSTGraph from './StandardBSTGraph.js';
import GeometricBSTGraph from './GeometricBSTGraph.js';
import {store} from './main.js';
require('../sass/home.scss');
import {INSERT_NODE, ADD_POINT} from './constants';

class Home extends React.Component {
  constructor () {
    super();
    this.state = {
      newElement: '',
      standard: true,
      geometric: true,
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.selectView = this.selectView.bind(this);
    this.insertSequence1 = this.insertSequence1.bind(this);
    this.insertSequence2 = this.insertSequence2.bind(this);
  }
  handleInsert (newElement) {
    if(newElement === '')return;
    if(this.state.standard) {
      store.dispatch({ type: INSERT_NODE, newElement });
    }
    if(this.state.geometric) {
      store.dispatch({ type: ADD_POINT, newElement });
    }
  }
  insertElement (event) {
    event.preventDefault();
    let newElement = this.state.newElement;
    this.handleInsert(newElement);
    this.setState({newElement: ''});
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  selectView (event) {
    let state = this.state;
    state[event.target.value] =  event.target.checked;
    this.setState(state);
  }
  insertSequence1 () {
    this.handleInsert(1);
    this.handleInsert(2);
    this.handleInsert(3);
    this.handleInsert(4);
    this.handleInsert(5);
  }
  insertSequence2 () {
    this.handleInsert(0);
    this.handleInsert(4);
    this.handleInsert(2);
    this.handleInsert(6);
    this.handleInsert(1);
    this.handleInsert(5);
    this.handleInsert(3);
    this.handleInsert(7);
  }
  render () {
    return (
      <main>
        <h1 id="title">Binary Search Tree Visualizer</h1>
        <div id="graphTitles">
          <div>
            <h2>Standard View</h2>
            <h2>Geometric View</h2>
          </div>
        </div>
        <form id="insertElement" onSubmit={this.insertElement}>
            Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
          <button onClick={this.insertSequence1}>Sequence 1</button>
          <button onClick={this.insertSequence2}>Sequence 2</button>
        </form>
        <div id="inserts">
          <h4>Enable Inserts:</h4>
          <div>Standard View</div>
          <label htmlFor="standardInsert" className="toggle">
            <input type="checkbox" value="standard" id="standardInsert"
              onChange={this.selectView}  checked={this.state.standard}/>
            <span></span>
          </label>
          <div>Geometric View</div>
          <label htmlFor="geometricInsert" className="toggle">
            <input type="checkbox" value="geometric" id="geometricInsert"
              onChange={this.selectView}  checked={this.state.geometric}/>
            <span></span>
          </label>
        </div>
        <div id="graphs">
          <StandardBSTGraph />
          <GeometricBSTGraph />
        </div>
      </main>
    );
  }
}

export default Home;
