import React from 'react';
import *as d3 from 'd3';
import VEBNode from './VEBNode';
import XFastNode from './XFastNode';
const ELEMENT_WIDTH = 30;
const ELEMENT_HEIGHT = 20;
require('../sass/xfast.scss');

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class XFastGraph extends React.Component {
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
    this.initializeD3Graph = this.initializeD3Graph.bind(this);
  }

  changeElement (event) {
    let value = event.target.value;
    if(value >= Math.pow(2, this.state.root.bits))return;
    if(value < 0)return;
    this.setState({newElement: value});
  }

  insertElement (event) {
    event.preventDefault();
    if(isNaN(parseInt(this.state.newElement)))return;
    let newElement = this.state.newElement;
    this.state.root.insert(newElement);

    let veb = d3.select('svg#veb');

    let bitvector = this.state.root.bitvector();
    let xfast = new XFastNode(bitvector);
    let linkList = xfast.getPath(newElement).reverse();

    this.setState({newElement: ''});
  }

  doubleBits () {
    if(this.state.root.bits == 8)return;
    this.setState({root: new VEBNode(this.state.root.bits * 2)},
      this.initializeD3Graph);
  }

  halveBits () {
    if(this.state.root.bits == 2)return;
    this.setState({root: new VEBNode(this.state.root.bits / 2)},
      this.initializeD3Graph);
  }

  render () {
    return (
      <main id="xfast">
        <h1 id="title"><a href="https://en.wikipedia.org/wiki/X-fast_trie">X-Fast (vEB) Tree View</a></h1>
        <form onSubmit={this.insertElement}>
          <p>Insert an element</p>
          <div className="tooltip">?
            <span className="tooltiptext">An X-fast tree improves upon a vEB tree by not storing elements that don't exist.</span>
          </div>
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
          <span>{Number(this.state.newElement).toString(2)}</span>
        </form>
        <div id="bittricks">
          <button onClick={this.halveBits}>Halve bits</button>
          <button onClick={this.doubleBits}>Double bits</button>
          <span> Current Size: {this.state.root.bits} bits </span>
          <span> Max Value: {Math.pow(2, this.state.root.bits) - 1} </span>
        </div>
        <svg id="veb" className="graph">
          <g id="links"/>
          <g id="nodes"/>
          <g id="values"/>
        </svg>
      </main>
    );
  }

  //when the graph is resized this function recenters the view on the tree
  initializeD3Graph () {
    let veb = d3.select('svg#veb');
    let parent = veb.node().getBoundingClientRect();
    var width = ELEMENT_WIDTH * Math.pow(2, this.state.root.bits + 1);
    var height = 2 * ELEMENT_HEIGHT * (this.state.root.bits + 1);
    var midX = parent.width / 2;
    var midY = parent.height / 2;

    if(width == 0 || height == 0)return; //nothing to fit

    //compute the scale to fit everything, with a bit of leeway
    var scale = 0.85 / Math.max(width / parent.width, height / parent.height);
    var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    let transform = d3.zoomTransform(veb).translate(...translate).scale(scale).toString();

    d3.select('#nodes').attr('transform', transform);
    d3.select('#links').attr('transform', transform);
    d3.select('#values').attr('transform', transform);

    //reset the zoom handler to account for this scaling when the user scolls/pans
    veb.on('.zoom', null);
    let zoom = d3.zoom()
      .on('zoom', d => {
        let updatedtransform = d3.event.transform.translate(...translate).scale(scale);
        d3.select('#nodes').attr('transform', updatedtransform);
        d3.select('#links').attr('transform', updatedtransform);
        d3.select('#values').attr('transform', updatedtransform);
      });
    veb.call(zoom);
  }

  componentDidMount () {
    let veb = d3.select('svg#veb');
    let zoom = d3.zoom()
      .on('zoom', d => {
        console.log(d3.event.transform);
        d3.select('#nodes').attr('transform', d3.event.transform);
        d3.select('#links').attr('transform', d3.event.transform);
        d3.select('#values').attr('transform', d3.event.transform);
      });
    veb.call(zoom);
    this.componentDidUpdate();
  }

  componentDidUpdate () {
    let veb = d3.select('svg#veb');
    let height = veb.node().getBoundingClientRect().height;
    let heightMargin = height / 5;
    let width = veb.node().getBoundingClientRect().width;

    //construct an x-fast tree using the user inserted nodes
    let bitvector = this.state.root.bitvector();
    let xfast = new XFastNode(bitvector);

    //traverse the x-fast tree and and set the position of each node
    let bitNodes = xfast.traversal();
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

    //display all the nodes
    veb.selectAll('svg.node').remove();
    let nodes = veb.select('#nodes').selectAll('svg.node')
      .data(bitNodes);
    let nodeG = nodes.enter()
      .append('svg')
      .attr('class', 'node')
      .attr('x', d => d.x - 1)
      .attr('y', d => d.y - 1)
      .attr('width', ELEMENT_WIDTH + 2)
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
      .text((d, i) => 1);

    nodes.exit().remove();

    //helper function to create one type of link for direct child pointers
    //and another type of link between a node and its descendant leaf
    function linkChildren (parent) {
      let linkList = [];
      if(parent.left !== null) {
        linkList.push({source: parent, target: parent.left, isChildPointer: true});
        linkList.push(...linkChildren(parent.left));
      }
      if(parent.right !== null) {
        linkList.push({source: parent, target: parent.right, isChildPointer: true});
        linkList.push(...linkChildren(parent.right));
      }
      if(parent.leftDescendant !== null) {
        linkList.push({source: parent, target: parent.leftDescendant, isChildPointer: false});
      }
      if(parent.rightDescendant !== null) {
        linkList.push({source: parent, target: parent.rightDescendant, isChildPointer: false});
      }
      return linkList;
    }

    //display the links
    let linkList = linkChildren(xfast);
    veb.selectAll('path.link').remove();
    let links = veb.select('#links').selectAll('path.link').data(linkList, d => d.target.id);

    //helper function to draw an arc to leaves
    function drawPath (context, radius) {
      context.moveTo(radius, 0);
      context.arc(0, 0, radius, 0, 2 * Math.PI);
    }

    links
      .enter().append('path')
      .attr('class', 'link')
      .attr('stroke', d => d.isChildPointer ? 'white' : '#55beff')
      .attr('stroke-width', 5)
      .attr('fill', 'none')
      .attr('opacity', d => d.isChildPointer ? '1' : '.2')
      .attr('d', d => {
        let x0 = d.source.x + ELEMENT_WIDTH / 2;
        let x1 = d.target.x + ELEMENT_WIDTH / 2;
        let y0 = d.source.y + ELEMENT_HEIGHT / 2;
        let y1 = d.target.y + ELEMENT_HEIGHT / 2;
        var context = d3.path();
        context.moveTo(x0, y0);
        if(d.isChildPointer) {
          context.lineTo(x1, y1);
          return context.toString();
        }
        context.bezierCurveTo(x0, y0, x0 + (x0 - x1) * 1.1, y1 * 1.1, x1, y1);
        //console.log(context);
        return context.toString();
      });
    links.exit().remove();

    //underneath the graph it's helpful to display the actual number each sequence of
    //bits represents
    let leafNodes = bitNodes.filter(d => d.isLeaf);
    veb.selectAll('svg.value').remove();
    let values = veb.select('#values').selectAll('svg.value').data(leafNodes);

    let valuesG = values.enter()
      .append('svg')
      .attr('class', 'value')
      .attr('x', d => d.x - 1)
      .attr('y', d => d.y - 1 + ELEMENT_HEIGHT * 2)
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
      .text((d, i) => d.prefix);

    values.exit().remove();
  }
}

export default XFastGraph;
