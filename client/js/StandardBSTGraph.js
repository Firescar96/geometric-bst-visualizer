import React from 'react';
import { connect } from 'react-redux';
import *as d3 from 'd3';
import Node from './StandardBSTNode';
import {store} from './main.js';
import {Point} from './GeometricBST';
const NODE_RADIUS = 10;
import {ADD_POINT, INSERT_NODE, SET_ROOT, CLEAR_POINTS, REBALANCE} from './constants';
require('../sass/standardBSTGraph.scss');

function standardBSTReducer (state, action) {
  if(state === undefined) {
    return {
      root: null,
      nonce: 0, //used to force an update to the DOM
      rebalance: true, //should the bst rebalance or not
      accessSequence: [], //used to construct the geometric view
      timestep: 1,
      satisfierPoints: [],
    };
  }

  switch (action.type) {
    case SET_ROOT:
      return Object.assign({}, state, {
        root: action.root,
        nonce: ++state.nonce,
        accessSequence: [{key: action.root.key, isAncestor: false}],
        satisfierPoints: [],
      });
    case INSERT_NODE:
      if(state.root === null) {
        let newNode = new Node(action.newElement);
        return Object.assign({}, state, {
          root: newNode,
          nonce: ++state.nonce,
          accessSequence: [{key: action.newElement, isAncestor: false}],
          timestep: ++state.timestep,
          satisfierPoints: [],
        });
      }
      let previousSequenceLength = state.accessSequence.length;
      let satisfierPoints = [];
      state.root.insert(action.newElement, state.rebalance, state.accessSequence);
      for(var i = previousSequenceLength; i < state.accessSequence.length - 1; i++) {
        let point = new Point(state.accessSequence[i].key, state.timestep, true);
        satisfierPoints.push(point);
      }
      return Object.assign({}, state, {
        nonce: ++state.nonce,
        accessSequence: state.accessSequence,
        timestep: state.timestep + 1,
        satisfierPoints: satisfierPoints,
      });
    case REBALANCE:
      return Object.assign({}, state, {
        rebalance: action.rebalance,
      });
    default:
      return state;
  }
}

class StandardBSTGraph extends React.Component {
  constructor (props) {
    super(props);
    this.makeGeometricBST = this.makeGeometricBST.bind(this);
    this.selectRebalance = this.selectRebalance.bind(this);
  }
  makeGeometricBST () {
    store.dispatch({type: CLEAR_POINTS});
    let nodes = this.props.accessSequence;
    let timestep = 1;
    nodes.forEach((node, i) => {
      let point = new Point(node.key, timestep, node.isAncestor);
      store.dispatch({type: ADD_POINT, point});
      if(!node.isAncestor) timestep++;
    });
  }
  selectRebalance (event) {
    store.dispatch({type: REBALANCE, rebalance: event.target.checked});
  }
  render () {
    return (
      <div id="standardBSTGraph">
        <button onClick={this.makeGeometricBST}>Generate Geometric View</button>
        <span className="label">Rebalancing</span>
        <div id="rebalancingTooltip" className="tooltip">?
          <span className="tooltiptext">When enabled the tree rebalances into an AVL tree</span>
        </div>
        <label htmlFor="rebalance" className="toggle">
          <input type="checkbox" value="standard" id="rebalance"
            onChange={this.selectRebalance}  checked={this.props.rebalance}/>
          <span></span>
        </label>
        <div className="svgContainer">
          <div id="standardTooltip" className="tooltip">?
            <span className="tooltiptext">after inserting elements: click and drag to pan,
              use the scroll wheel to zoom</span>
          </div>
          <svg id="standard" className="graph">
            <g id="links"></g>
            <g id="nodes"></g>
          </svg>
        </div>
      </div>
    );
  }

  componentDidMount () {
    var zoom = d3.zoom()
      .on('zoom', () => {
        d3.select('#nodes').attr('transform', d3.event.transform);
        d3.select('#links').attr('transform', d3.event.transform);
      });
    d3.select('#standard')
      .call(zoom);
  }

  componentDidUpdate () {
    if(this.props.root === null)return;
    if(this.props.geometricEnabled) {
      //if the last insert generated satisfier points those need to be sent to the geometricBST
      this.props.satisfierPoints.forEach(point => {
        store.dispatch({type: ADD_POINT, point});
      });
    }
    let standard = d3.select('#standard');

    let linkChildren = (d) => {
      let linkList = [];
      if(d == this.props.root) {
        d.x = standard.node().getBoundingClientRect().width / 2;
        d.y = standard.node().getBoundingClientRect().height / 3;
      }else {
        let delta = NODE_RADIUS;
        delta *= Math.pow(2, d.parent.height);
        d.x = d == d.parent.left ? d.parent.x - delta : d.parent.x + delta;
        d.y = d.parent.y + 50;
      }

      if(d.left !== null) {
        linkList.push({source: d, target: d.left});
        linkList.push(...linkChildren(d.left));
      }
      if(d.right !== null) {
        linkList.push({source: d, target: d.right});
        linkList.push(...linkChildren(d.right));
      }
      return linkList;
    };

    let linkList = linkChildren(this.props.root);
    let link = standard.select('#links').selectAll('line.link').data(linkList, d => {
      return d.target.id;
    });
    link
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x + NODE_RADIUS * 2)
      .attr('y1', d => d.source.y + NODE_RADIUS * 2)
      .attr('x2', d => d.target.x + NODE_RADIUS * 2)
      .attr('y2', d => d.target.y + NODE_RADIUS * 2)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 5)
      .attr('opacity', 0);
    link.exit().remove();

    let nodes = this.props.root.traversal();
    let node = standard.select('#nodes').selectAll('svg.node')
      .data(nodes, d => d.id);

    let nodeG = node.enter()
      .append('svg')
      .attr('class', 'node')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', '40')
      .attr('height', '40')
      .attr('opacity', 0);

    nodeG
      .append('circle')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', 19);

    nodeG
      .append('text')
      .attr('class', 'node')
      .attr('fill', 'white')
      .attr('x', '50%')
      .attr('y', '50%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.key);

    nodeG
      .append('circle')
      .attr('class', 'node')
      .attr('stroke', 'green')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('fill', 'transparent')
      .attr('r', 19)
      .on('click', (d1) => {
        d3.selectAll('circle.node')
          .attr('stroke', d2 => d1.key == d2.key ? 'green' : null);
        if(this.props.geometricEnabled) {
          store.dispatch({ type: ADD_POINT, newElement: d1.key });
        }
      });

    node.exit().remove();

    standard.selectAll('svg.node')
      .transition()
      .duration(500)
      .attr('opacity', 1)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);

    d3.selectAll('circle.node')
      .attr('stroke', d => this.props.root.lastTouched.key == d.key ? 'green' : null);

    standard.selectAll('text.node')
      .text((d) => d.key);

    standard.selectAll('line.link').transition()
      .duration(500)
      .attr('x1', d => d.source.x + NODE_RADIUS * 2)
      .attr('y1', d => d.source.y + NODE_RADIUS * 2)
      .attr('x2', d => d.target.x + NODE_RADIUS * 2)
      .attr('y2', d => d.target.y + NODE_RADIUS * 2)
      .attr('opacity', 1);

  }
}

export default connect(function (state, ownProps) {
  return {
    root: state.standardBST.root,
    nonce: state.standardBST.nonce,
    rebalance: state.standardBST.rebalance,
    accessSequence: state.standardBST.accessSequence,
    satisfierPoints: state.standardBST.satisfierPoints,
  };
})(StandardBSTGraph);

export {standardBSTReducer};
