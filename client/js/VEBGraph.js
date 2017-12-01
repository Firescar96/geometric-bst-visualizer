import React from 'react';
import *as d3 from 'd3';
import VEBNode from './VEBNode';
const ELEMENT_WIDTH = 30;
const ELEMENT_HEIGHT = 20;

class vEBGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
      root: new VEBNode(2),
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
      <div>
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
        </form>
        <button onClick={this.makeGeometricBST}>Make Geometric BST</button>
        <svg id="veb" className="graph">
          <g id="links"/>
          <g id="nodes"/>
        </svg>
      </div>
    );
  }

  componentDidMount () {
    let keys = this.state.root.traversal();

    let nodes = [];
    let clusters = this.state.root.clusterTraversal();
    let treeHeight = Math.log(this.state.root.bits, 2);
    clusters.forEach(c => {
      //return a list these one for each object element
      let clusterHeight = Math.log(c.bits, 2);
      let depth = (treeHeight - clusterHeight);
      for(var i = 0; i < c.bits; i++) {
        console.log(c);
        nodes.push({
          y: depth * ELEMENT_HEIGHT * 2,
          //spacing between clusters   cluster width
          x: (c.parentIndex * c.size * 2 + i) * ELEMENT_WIDTH,
        });
      }
    });
    console.log(nodes);
    let veb = d3.select('#veb');
    let element = veb.select('#nodes').selectAll('rect.element').data(nodes);
    let height = veb.node().getBoundingClientRect().height;
    let heightMargin = height / 5;

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
