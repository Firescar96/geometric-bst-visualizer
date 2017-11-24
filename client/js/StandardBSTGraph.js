import React from 'react';
import { connect } from 'react-redux';
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
    };
  }

  switch (action.type) {
    case SET_ROOT:
      return Object.assign({}, state, {
        root: action.root,
        nonce: ++state.nonce,
      });
    case INSERT_NODE:
      let newElement = isNaN(action.newElement) ?
        parseInt(action.newElement.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) :
        parseFloat(action.newElement);
      if(state.root === null) {
        return Object.assign({}, state, {
          root: new Node(newElement, action.newElement),
          nonce: ++state.nonce,
        });
      }
      state.root.insert(newElement, action.newElement, state.rebalance);
      return Object.assign({}, state, {
        nonce: ++state.nonce,
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
    this.simulation = d3.forceSimulation();
    this.makeGeometricBST = this.makeGeometricBST.bind(this);
    this.selectRebalance = this.selectRebalance.bind(this);
  }
  makeGeometricBST () {
    store.dispatch({type: CLEAR_POINTS});
    let nodes = this.props.root.levelTraversal();
    nodes.forEach((node, i) => {
      let point = new Point(node.key, node.value, i + 1);
      store.dispatch({type: ADD_POINT, point});
      node.getAncestors().forEach(ancestor => {
        point = new Point(ancestor.key, ancestor.value, i + 1);
        point.isSatisfier = true;
        store.dispatch({type: ADD_POINT, point});
      });
    });
  }
  selectRebalance (event) {
    store.dispatch({type: REBALANCE, rebalance: event.target.checked});
  }
  render () {
    return (
      <div id="standardBSTGraph">
        <button onClick={this.makeGeometricBST}>Make Geometric BST</button>
        <span className="label">Rebalancing</span>
        <label htmlFor="rebalance" className="toggle">
          <input type="checkbox" value="standard" id="rebalance"
            onChange={this.selectRebalance}  checked={this.props.rebalance}/>
          <span></span>
        </label>
        <svg id="standard" className="graph">
          <g id="links"></g>
          <g id="nodes"></g>
        </svg>
      </div>
    );
  }

  componentDidMount () {
    let standard = d3.select('#standard');
    this.simulation
      .force('collision', d3.forceCollide().radius(NODE_RADIUS + 5))
      .force('manyBody', d3.forceManyBody().strength(1))
      .on('tick', () => {
        standard.selectAll('svg.node').transition()
          .ease(v => d3.easeSinIn(v))
          .duration(100)
          .attr('x', (d) => {
            if(d.parent !== null && d.parent.x !== null) {
              let delta = NODE_RADIUS;
              delta *= Math.pow(2, d.parent.height);
              d.x = d == d.parent.left ? d.parent.x - delta : d.parent.x + delta;
            }
            return d.x;
          })
          .attr('y', (d) => {
            if(d.parent !== null && d.parent.y !== null) {
              d.y = d.parent.y + 50;
            }
            return d.y;
          });

        if(this.props.root !== null) {
          this.props.root.fx = standard.node().getBoundingClientRect().width / 2;
          this.props.root.fy = standard.node().getBoundingClientRect().height / 3;
        }

        standard.selectAll('text.node')
          .text((d) => d.value);

        standard.selectAll('line.link').transition()
          .duration(100)
          .ease(v => d3.easeSinIn(v))
          .attr('x1', d => d.source.x + NODE_RADIUS * 2)
          .attr('y1', d => d.source.y + NODE_RADIUS * 2)
          .attr('x2', d => d.target.x + NODE_RADIUS * 2)
          .attr('y2', d => d.target.y + NODE_RADIUS * 2);
      });
    this.componentDidUpdate();
  }

  componentDidUpdate () {
    if(this.props.root === null)return;
    let standard = d3.select('#standard');

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

    let linkList = linkChildren(this.props.root);
    let link = standard.select('#links').selectAll('line.link').data(linkList, d => {
      return d.target.id;
    });
    link
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 5);
    link.exit().remove();

    let nodes = this.props.root.traversal();
    let node = standard.select('#nodes').selectAll('svg.node')
      .data(nodes, d => d.id);

    let nodeG = node.enter()
      .append('svg')
      .attr('class', 'node')
      .attr('width', '40')
      .attr('height', '40');

    nodeG
      .append('circle')
      .attr('class', 'node')
      .attr('stroke', 'white')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', 20);

    nodeG
      .append('text')
      .attr('class', 'node')
      .attr('fill', 'white')
      .attr('x', '50%')
      .attr('y', '50%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.value);

    node.exit().remove();

    this.simulation.nodes(nodes)
      .force('link', d3.forceLink(linkList).strength(0.5).distance(100))
      .alpha(1)
      .restart();
  }
}

export default connect(function (state, ownProps) {
  return {
    root: state.standardBST.root,
    nonce: state.standardBST.nonce,
    rebalance: state.standardBST.rebalance,
  };
})(StandardBSTGraph);

export {standardBSTReducer};
