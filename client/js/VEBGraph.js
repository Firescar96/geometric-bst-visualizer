import React from 'react';
import *as d3 from 'd3';
import VEBNode from './VEBNode';
import TreeView from './TreeView';
const ELEMENT_WIDTH = 30;
const ELEMENT_HEIGHT = 20;
require('../sass/veb.scss');

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class vEBGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
      root: new VEBNode(2),
    };
    window.tree = this.state.root;
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.doubleBits = this.doubleBits.bind(this);
    this.halveBits = this.halveBits.bind(this);
  }

  changeElement (event) {
    let value = event.target.value;
    if(parseInt(value) == NaN) return;
    if(value >= Math.pow(2, this.state.root.bits)) return;
    if(value < 0) return;
    this.setState({newElement: value});
  }

  insertElement (event) {
    event.preventDefault();
    let newElement = this.state.newElement;
    this.state.root.insert(newElement);

    let veb = d3.select('svg#veb');

    let bitvector = this.state.root.bitvector();
    let treeView = new TreeView(bitvector);
    let linkList = treeView.getPath(newElement).reverse();

    (async () => {
      let links = veb.select('#links').selectAll('line');
      let n = this.state.root.bits;
      while(linkList.length > 0) {
        let curLinks = linkList.splice(0, Math.max(linkList.length/2, 1))
        links.attr('stroke', 'white')
        links.data(curLinks, d => d.target.id)
         .attr('stroke', 'green')
        await sleep(500);
      }

      this.setState({newElement: ''});
    })()
  }

  doubleBits () {
    if(this.state.root.bits == 8) return;
    this.setState({root: new VEBNode(this.state.root.bits*2)},
      this.initializeD3Graph)
  }

  halveBits () {
    if(this.state.root.bits == 2) return;
    this.setState({root: new VEBNode(this.state.root.bits/2)},
      this.initializeD3Graph)
  }

  render () {
    return (
      <main id="veb">
        <h1 id="title">vEB Geometric Tree View</h1>
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
          <span>{Number(this.state.newElement).toString(2)}</span>
        </form>
        <div>
          <button onClick={this.halveBits}>Halve bits</button>
          <button onClick={this.doubleBits}>Double bits</button>
        </div>
        <svg id="veb" className="graph">
          <g id="links"/>
          <g id="nodes"/>
          <g id="values"/>
        </svg>
      </main>
    );
  }

  componentDidMount () {
    var zoom = d3.zoom()
      .on('zoom', () => {
        d3.select('#nodes').attr('transform', d3.event.transform);
        d3.select('#links').attr('transform', d3.event.transform);
        d3.select('#values').attr('transform', d3.event.transform);
      });
    let veb = d3.select('svg#veb')
      .call(zoom);
    this.initializeD3Graph();
  }

  componentDidUpdate () {
    let veb = d3.select('svg#veb');
    //console.log(this.state.root);
    let bitvector = this.state.root.bitvector();
    let treeView = new TreeView(bitvector);
    let bitNodes = treeView.traversal();
    veb.selectAll('text.node').data(bitNodes)
      .text((d) => d.value);

    veb.selectAll('line')
      .attr('stroke', '#ddd')

    let leafNodes = bitNodes.filter(d => d.left == null && d.right == null)
    veb.selectAll('text.value').data(leafNodes)
      .text((d, i) => d.value ? i : null);
  }

  initializeD3Graph () {
    window.d3 = d3;
    let veb = d3.select('svg#veb');

    let height = veb.node().getBoundingClientRect().height;
    let heightMargin = height / 5;
    let width = veb.node().getBoundingClientRect().width;

    let bitvector = this.state.root.bitvector();
    let treeView = new TreeView(bitvector);
    let bitNodes = treeView.traversal();
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
      node.x = node == node.parent.left ? node.parent.x - delta : node.parent.x + delta;
      node.y = node.parent.y + ELEMENT_HEIGHT * 3;
    });

    veb.selectAll('svg.node').remove();
    let nodes = veb.select('#nodes').selectAll('svg.node')
      .data(bitNodes)
    let nodeG = nodes.enter()
      .append('svg')
      .attr('class', 'node')
      .attr('x', d => d.x - 1)
      .attr('y', d => d.y - 1)
      .attr('width', ELEMENT_WIDTH + 1)
      .attr('height', ELEMENT_HEIGHT + 2);

    nodeG.append('rect')
      .attr('class', 'node')
      .attr('x', 1)
      .attr('y', 1)
      .attr('width', ELEMENT_WIDTH)
      .attr('height', ELEMENT_HEIGHT)
      .attr('fill', 'black')
      .attr('stroke', 'white');

    nodeG.append('text')
      .attr('class', 'node')
      .attr('fill', 'white')
      .attr('x', '50%')
      .attr('y', '60%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.value);

    nodes.exit().remove();

    function linkChildren (parent) {
      let linkList = [];
      if(parent.left !== null) {
        linkList.push({source: parent, target: parent.left});
        linkList.push(...linkChildren(parent.left));
      }
      if(parent.right !== null) {
        linkList.push({source: parent, target: parent.right});
        linkList.push(...linkChildren(parent.right));
      }
      return linkList;
    }

    let linkList = linkChildren(treeView);
    veb.selectAll('line.link').remove();
    let links = veb.select('#links').selectAll('line.link').data(linkList, d => d.target.id);

    links
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 5)
      .attr('x1', d => d.source.x + ELEMENT_WIDTH / 2)
      .attr('y1', d => d.source.y + ELEMENT_WIDTH / 2)
      .attr('x2', d => d.target.x + ELEMENT_WIDTH / 2)
      .attr('y2', d => d.target.y + ELEMENT_WIDTH / 2);
    links.exit().remove();

    let leafNodes = bitNodes.filter(d => d.left == null && d.right == null)
    veb.selectAll('svg.value').remove()
    let values = veb.select('#values').selectAll('svg.value').data(leafNodes)

    let valuesG = values.enter()
      .append('svg')
      .attr('class', 'value')
      .attr('x', d => d.x - 1)
      .attr('y', d => d.y - 1 + ELEMENT_HEIGHT*2)
      .attr('width', ELEMENT_WIDTH + 1)
      .attr('height', ELEMENT_HEIGHT + 1);

    valuesG.append('line')
      .attr('class', 'value')
      .attr('x1', 1)
      .attr('y1', ELEMENT_HEIGHT)
      .attr('x2', ELEMENT_WIDTH)
      .attr('y2', ELEMENT_HEIGHT)
      .attr('fill', 'black')
      .attr('stroke', 'white');

    valuesG.append('text')
      .attr('class', 'value')
      .attr('fill', 'white')
      .attr('x', '50%')
      .attr('y', '60%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')

    values.exit().remove();
  }
}

export default vEBGraph;
