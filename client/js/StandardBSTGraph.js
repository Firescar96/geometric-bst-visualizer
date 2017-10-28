import React from 'react';
import { connect } from 'react-redux';
import Node from './StandardBSTNode';
import {store} from './main.js';
const NODE_RADIUS = 10;
const ADD_ROOT = 'ADD ROOT';

function addRoot (newElement) {
  return { type: ADD_ROOT, newElement };
}

function standardBSTReducer (state, action) {
  if(state === undefined) {
    return {
      root: null,
      numElements: 0,
    };
  }

  switch (action.type) {
    case ADD_ROOT:
      if(state.root === null) {
        return {
          root: new Node(action.newElement),
          numElements: ++state.numElements,
          newElement: action.newElement,
        };
      }
      state.root.insert(action.newElement);
      return Object.assign({}, state, {
        numElements: ++state.numElements,
        newElement: action.newElement,
      });
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
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    let newElement = this.state.newElement;

    event.preventDefault();
    store.dispatch(addRoot(newElement));
    this.setState({newElement: ''}, () => {
      this.update();
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
    //.force('order', d3.forceY().strength(-0.1))
      .on('tick', () => {
        standard.selectAll('svg.node').transition()
          .ease(v => d3.easeSinIn(v))
          .duration(100)
          .attr('x', (d) => {
            if(d.parent !== undefined && d.parent.x !== undefined) {
              let delta = NODE_RADIUS;
              delta *= Math.pow(2, d.parent.height);
              d.x = d == d.parent.left ? d.parent.x - delta : d.parent.x + delta;
            }
            return d.x;
          })
          .attr('y', (d) => {
            if(d.parent !== undefined && d.parent.y !== undefined) {
              d.y = d.parent.y + 50;
            }
            return d.y;
          });

        if(this.props.root !== null) {
          this.props.root.fx = standard.node().getBoundingClientRect().width / 2;
          this.props.root.fy = standard.node().getBoundingClientRect().height / 2;
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
    this.update();
  }

  update () {
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
      console.log(d.target);
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
    root: state.root,
  };
})(StandardBSTGraph);

export {standardBSTReducer};