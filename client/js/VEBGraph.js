import React from 'react';
import *as d3 from 'd3';
import VEBNode from './VEBNode';
import TreeView from './TreeView';
const ELEMENT_WIDTH = 30;
const ELEMENT_HEIGHT = 20;
require('../sass/veb.scss');

class vEBGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
      root: new VEBNode(4),
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
  }

  changeElement (event) {
    this.setState({newElement: event.target.value});
  }

  insertElement (event) {
    event.preventDefault();
    let newElement = this.state.newElement;

    this.setState({newElement: ''});
  }

  render () {
    return (
      <main id="veb">
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
        </form>
        <svg id="veb" className="graph">
          <g id="links"/>
          <g id="nodes"/>
        </svg>
      </main>
    );
  }

  componentDidMount () {
    let veb = d3.select('svg#veb');
    let height = veb.node().getBoundingClientRect().height;
    let heightMargin = height / 5;
    let width = veb.node().getBoundingClientRect().width;

    let bitvector = this.state.root.bitvector();
    let treeView = new TreeView(bitvector);
    let bitNodes = treeView.traversal();
    console.log('bitvector', bitNodes);
    let treeHeight = Math.log2(bitvector.length) - 1;
    bitNodes.forEach(node => {
      if(!node.parent) {
        node.x = width / 2;
        node.y = heightMargin;
        return;
      }
      let nodeHeight = Math.log2(node.bitvector.length) - 1;
      let depth = (treeHeight - nodeHeight);
      //align to parent  spacing between clusters
      let delta = ELEMENT_WIDTH * Math.pow(2, nodeHeight + 1);
      console.log('delta', node.bitvector, delta, node.parent.x);
      node.x = node == node.parent.left ? node.parent.x - delta : node.parent.x + delta;
      console.log('xpos', node.x);
      node.y = node.parent.y + ELEMENT_HEIGHT * 5;
    });
    console.log('bitnodes', bitNodes);
    let element = veb.select('#nodes').selectAll('rect.element').data(bitNodes);

    element.enter()
      .append('rect')
      .attr('class', 'element')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', ELEMENT_WIDTH)
      .attr('height', ELEMENT_HEIGHT)
      .attr('fill', 'none')
      .attr('stroke', 'white');

    element.exit().remove();
  }

  componentDidUpdate () {
    //TODO
  }
}

export default vEBGraph;
