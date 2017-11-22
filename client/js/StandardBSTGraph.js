import React from 'react';
import { connect } from 'react-redux';
import Node from './StandardBSTNode';
import {store} from './main.js';
import {Point} from './GeometricBST';
const NODE_RADIUS = 10;
import {ADD_POINT, INSERT_NODE, SET_ROOT, CLEAR_POINTS} from './constants';

function standardBSTReducer (state, action) {
  if(state === undefined) {
    return {
      root: null,
    };
  }

  switch (action.type) {
    case SET_ROOT:
      return Object.assign({}, state, {
        root: action.root,
      });
    case INSERT_NODE:
      let newElement = isNaN(action.newElement) ?
        parseInt(action.newElement.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) :
        parseFloat(action.newElement);
      if(state.root === null) {
        return Object.assign({}, state, {
          root: new Node(newElement),
        });
      }
      state.root.insert(newElement);
    default:
      return state;
  }
}

class StandardBSTGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      simulation: d3.forceSimulation(),
      newElement: '',
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.makeGeometricBST = this.makeGeometricBST.bind(this);
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    let newElement = this.state.newElement;

    event.preventDefault();
    store.dispatch({ type: INSERT_NODE, newElement });
    this.setState({newElement: ''});
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
          <g id="links"></g>
          <g id="nodes"></g>
        </svg>
      </div>
    );
  }

  componentDidMount () {
    let standard = d3.select('#standard');
    this.state.simulation
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
          .text((d) => d.key);

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
      .attr('r', 20)
      .text((d) => d.key);

    nodeG.exit().remove();

    nodeG
      .append('text')
      .attr('class', 'node')
      .attr('fill', 'white')
      .attr('x', '50%')
      .attr('y', '50%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.key);

    nodeG.exit().remove();

    this.state.simulation.nodes(nodes)
      .force('link', d3.forceLink(linkList).strength(0.5).distance(100))
      .alpha(1)
      .restart();
  }
}

export default connect(function (state, ownProps) {
  return {
    root: state.standardBST.root,
  };
})(StandardBSTGraph);

export {standardBSTReducer};
