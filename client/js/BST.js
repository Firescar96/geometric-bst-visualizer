import React from 'react';
import { connect } from 'react-redux';
import StandardBSTGraph from './StandardBSTGraph.js';
import GeometricBSTGraph from './GeometricBSTGraph.js';
import {store} from './main.js';
require('../sass/bst.scss');
import {INSERT_NODE, ADD_POINT} from './constants';

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class BST extends React.Component {
  constructor () {
    super();
    this.state = {
      newElement: '',
      standard: true,
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.selectView = this.selectView.bind(this);
    this.insertSequence1 = this.insertSequence1.bind(this);
    this.insertSequence2 = this.insertSequence2.bind(this);
    this.runningSequence = false;
  }
  handleInsert (newElement) {
    if(newElement === '')return;
    newElement = isNaN(newElement) ? newElement : parseFloat(newElement);
    if(this.state.standard) {
      store.dispatch({ type: INSERT_NODE, newElement });
    }
    store.dispatch({ type: ADD_POINT, newElement });
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
    if(this.runningSequence) return;
    this.runningSequence = true;
    (async () => {
    this.handleInsert(1);
    await sleep(1000)
    this.handleInsert(2);
    await sleep(1000)
    this.handleInsert(3);
    await sleep(1000)
    this.handleInsert(4);
    await sleep(1000)
    this.handleInsert(5);
    this.runningSequence = false;
  })()
  }
  insertSequence2 () {
    if(this.runningSequence) return;
    this.runningSequence = true;
    (async () => {
    this.handleInsert(0);
    await sleep(1000)
    this.handleInsert(8);
    await sleep(1000)
    this.handleInsert(4);
    await sleep(1000)
    this.handleInsert(12);
    await sleep(1000)
    this.handleInsert(2);
    await sleep(1000)
    this.handleInsert(10);
    await sleep(1000)
    this.handleInsert(6);
    await sleep(1000)
    this.handleInsert(14);
    await sleep(1000)
    this.handleInsert(1);
    await sleep(1000)
    this.handleInsert(9);
    await sleep(1000)
    this.handleInsert(5);
    await sleep(1000)
    this.handleInsert(13);
    await sleep(1000)
    this.handleInsert(3);
    await sleep(1000)
    this.handleInsert(11);
    await sleep(1000)
    this.handleInsert(7);
    await sleep(1000)
    this.handleInsert(15);
    this.runningSequence = false;
  })()
  }
  render () {
    return (
      <main id="bst">
        <h1 id="title">BST Visualizer</h1>
        <div id="graphTitles">
          <div>
            <h2><a href="https://en.wikipedia.org/wiki/Binary_search_tree">Standard View</a></h2>
            <h2><a href="https://en.wikipedia.org/wiki/Geometry_of_binary_search_trees">Geometric View</a></h2>
          </div>
        </div>
        <form id="insertElement" onSubmit={this.insertElement}>
            Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button id="insert" type="submit">Insert</button>
          <button id="sequence1" onClick={this.insertSequence1}>Sequence 1</button>
          <button id="sequence2" onClick={this.insertSequence2}>Sequence 2</button>
        </form>
        <div id="inserts">
          <p>Enable Standard View Inserts</p>
          <div className="tooltip">?
            <span className="tooltiptext">When enabled all touched points for a particular insert into the standard view will also be inserted into the geometric view.</span>
          </div>
          <label htmlFor="standardInsert" className="toggle">
            <input type="checkbox" value="standard" id="standardInsert"
              onChange={this.selectView}  checked={this.state.standard}/>
            <span></span>
          </label>
        </div>
        <div id="graphs">
          <StandardBSTGraph geometricEnabled={this.state.geometric} />
          <GeometricBSTGraph />
        </div>
      </main>
    );
  }
}

export default BST;
