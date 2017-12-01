import React from 'react';
import *as d3 from 'd3';
import VEBNode from './VEBNode';
const ELEMENT_WIDTH = 30;
const ELEMENT_HEIGHT = 20;
require('../sass/veb.scss');

class vEBGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
      root: new VEBNode(8),
    };
    console.log('root', this.state.root);
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

    let keys = this.state.root.traversal();

    let clusters = this.state.root.clusterTraversal();
    console.log(clusters);
    let treeHeight = Math.log(this.state.root.bits, 2) - 1;
    clusters.forEach(c => {
      if(!c.parent) {
        c.x = width / 2;
        c.y = heightMargin;
        return;
      }
      //return a list these one for each object element
      let clusterHeight = Math.log2(c.bits) - 1;
      let depth = (treeHeight - clusterHeight);
      //align to parent  spacing between clusters
      c.x = c.parent.x + Math.pow(2, clusterHeight + 1) * c.parentIndex * ELEMENT_WIDTH - Math.pow(2, clusterHeight + 1) * (c.bits - 1) * ELEMENT_WIDTH / 2;
      c.y = c.parent.y + ELEMENT_HEIGHT * 5;
      console.log('height', clusterHeight);
      //console.log((Math.pow(2, clusterHeight) * c.parentIndex) * ELEMENT_WIDTH);
    });
    console.log('clusters', clusters);
    let element = veb.select('#nodes').selectAll('rect.element').data(clusters);

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
