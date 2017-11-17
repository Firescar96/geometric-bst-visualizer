import React from 'react';
import { connect } from 'react-redux';
import BST from './GeometricBST';
import {store} from './main';
import MinHeap from './MinHeap';
const ADD_POINT = 'ADD POINT';
const INSERT_NODE = 'INSERT NODE';
const CLEAR_NODE = 'CLEAR NODE';
const CLEAR_POINTS = 'CLEAR POINTS';
window.MinHeap = MinHeap;
function geometricBSTReducer (state, action) {
  if(state === undefined) {
    return {
      newElement: null,
      bst: new BST(),
    };
  }

  switch (action.type) {
    case INSERT_NODE:
      return Object.assign({}, state, {
        newElement: action.newElement,
      });
    case CLEAR_NODE:
      return Object.assign({}, state, {
        newElement: null,
      });
    case ADD_POINT:
      state.bst.insertPoint(action.point);
      return state;
    case CLEAR_POINTS:
      return Object.assign({}, state, {
        bst: new BST(),
      });
    default:
      return state;
  }
}

class GeometricBSTGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      newElement: '',
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.runGreedyAlgorithm = this.runGreedyAlgorithm.bind(this);
    this.makeStandardBst = this.makeStandardBst.bind(this);
  }
  addPoint (_newElement) {
    this.props.bst.insert(_newElement);
    this.setState({
      newElement: '',
    });
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    event.preventDefault();
    this.addPoint(this.state.newElement);
  }
  makeStandardBst () {
    console.log(MinHeap);
  }
  runGreedyAlgorithm () {
    let points = this.props.bst.points;
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scaleLinear().range([widthMargin, width - widthMargin])
      .domain([d3.min(points, d => d.value) - 1, d3.max(points, d => d.value) + 1]);

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    for(var time = 1; time <= this.props.bst.maxTime; time++) {
      let satisfiedPoints = this.props.bst.runGreedyAlgorithm(time);
      let satisfyRect = geometric.selectAll('rect.satisfier')
        .data(satisfiedPoints);
      satisfyRect.enter()
        .append('rect')
        .attr('x', d => xRange(d.base.value))
        .attr('y', d => yRange(d.base.time))
        .transition()
        .duration(500)
        .attr('transform', d => {
          let satisfiedWidth = Math.abs(xRange(d.base.value) - xRange(d.satisfied.value));
          let satisfiedHeight = Math.abs(yRange(d.base.time) - yRange(d.satisfied.time));
          if(d.satisfied.value < d.base.value) {
            return 'translate(' + -satisfiedWidth
             + ',' + -satisfiedHeight + ')';
          }
          return 'translate(0,' + -satisfiedHeight + ')';
        })
        .attr('class', 'satisfier')
        .attr('stroke', 'green')
        .attr('fill', 'none')
        .attr('width', d => Math.abs(xRange(d.base.value) - xRange(d.satisfied.value)))
        .attr('height', d => Math.abs(yRange(d.base.time) - yRange(d.satisfied.time)))
        .transition()
        .delay(100)
        .remove();

      satisfyRect.exit();
    }
    this.componentDidUpdate();
  }
  clear () {
    this.setState({bst: new BST()});
  }
  render () {
    return (
      <div>
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
        </form>
        <button type="button" onClick={this.runGreedyAlgorithm}>Run Greedy Algorithm</button>
        <button onClick={this.makeStandardBst}>Make Standard BST</button>
        <svg id="geometric" className="graph"></svg>
      </div>
    );
  }
  componentDidUpdate () {
    if(this.props.newElement !== null) {
      this.addPoint(this.props.newElement);
      store.dispatch({type: CLEAR_NODE, newElement: null});
    }
    let points = this.props.bst.points;
    let nnSatisfierPoints = this.props.bst.points.filter(x => !x.isSatisfier);
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scaleLinear().range([widthMargin, width - widthMargin])
      .domain([d3.min(points, d => d.value) - 1, d3.max(points, d => d.value) + 1]);

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    let xAxis = d3.axisBottom(xRange)
      .ticks(nnSatisfierPoints.length);
    let yAxis = d3.axisLeft(yRange);

    //geometric.remove('g.xAxis');
    geometric.selectAll('g.xAxis')
      .call(xAxis);

    //geometric.remove('g.yAxis');
    geometric.selectAll('g.yAxis')
      .call(yAxis);

    let point = geometric.selectAll('circle.point').data(points, d=> d.value + ':' + d.time);
    point.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', d => d.isSatisfier ? 'red' : 'white')
      .attr('cx', d => xRange(d.value))
      .attr('cy', d => yRange(d.time))
      .attr('r', 5)
      .attr('opacity', d => d.isSatisfier ? 0 : 1)
      .transition()
      .duration(200)
      .delay(d => d.isSatisfier ? 500 : 0)
      .attr('opacity', 1);
    point.exit().remove();
    point.transition()
      .duration(200)
      .ease(v => d3.easeSinIn(v))
      .attr('fill', d => d.isSatisfier ? 'red' : 'white')
      .attr('cx', d => xRange(d.value))
      .attr('cy', d => yRange(d.time))
      .attr('opacity', 1);

    geometric.selectAll('rect.satisfier')
      .attr('transform', d => {
        let satisfiedWidth = Math.abs(xRange(d.base.value) - xRange(d.satisfied.value));
        let satisfiedHeight = Math.abs(xRange(d.base.time) - xRange(d.satisfied.time));
        if(d.satisfied.value < d.base.value) {
          return 'translate(' + -satisfiedWidth
           + ',' + -satisfiedHeight + ')';
        }
        return 'translate(0,' + -satisfiedHeight + ')';
      })
      .attr('class', 'satisfier')
      .attr('stroke', 'green')
      .attr('fill', 'none')
      .attr('width', d => Math.abs(xRange(d.base.value) - xRange(d.satisfied.value)))
      .attr('height', d => Math.abs(yRange(d.base.time) - yRange(d.satisfied.time)));
  }

  componentDidMount () {
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    geometric.append('g')
      .attr('class', 'xAxis')
      .attr('stroke', 'white')
      .attr('transform', 'translate(0,' + (height - heightMargin) + ')');

    geometric.append('g')
      .attr('class', 'yAxis')
      .attr('stroke', 'white')
      .attr('transform', 'translate(' + (widthMargin) + ',0)');
  }
}

export default connect(function (state, ownProps) {
  return {
    root: state.standardBST.root,
    newElement: state.geometricBST.newElement,
    bst: state.geometricBST.bst,
  };
})(GeometricBSTGraph);

export {geometricBSTReducer};
