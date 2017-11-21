import React from 'react';
import { connect } from 'react-redux';
import BST from './GeometricBST';
import Node from './StandardBSTNode';
import {store} from './main';
import MinHeap from './MinHeap';
import {ADD_POINT, SET_ROOT, INSERT_NODE, CLEAR_NODE, CLEAR_POINTS} from './constants';

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
      state.bst.insert(action.point);
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
    let newElement = isNaN(_newElement) ?
      parseInt(_newElement.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) :
      parseFloat(_newElement);
    this.props.bst.insert(newElement, _newElement);
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
    //this is a prerequisite
    this.runGreedyAlgorithm();
    //create a min heap on the points
    let heap = new MinHeap('time');
    this.props.bst.points.forEach(point => {
      heap.insert(point);
    });

    let rootPoint = heap.pop();
    let sbst = new Node(rootPoint.key, rootPoint.value);
    while(heap.hasNext() > 0) {
      //get all the touchedPoints for a particular access time
      let parentNode = sbst;
      let accessTime = heap.peek().time;
      let touchedPoints = [];
      let insertedPoint = null;
      while(heap.peek() !== undefined && heap.peek().time === accessTime) {
        let point = heap.pop();
        if(point.isSatisfier) {
          touchedPoints.push(point.key);
        }else {
          insertedPoint = point;
        }
      }

      //use the touchedPoints to figure out where to insert the insertedPoint
      let isDescending = true;
      let descend = (node) => {
        if(node === undefined)return;
        let touchedIndex = touchedPoints.indexOf(node.key);
        if(touchedIndex == -1)return false;
        touchedPoints = touchedPoints.splice(touchedIndex);
        parentNode = node;
        //return true if found
      };
      while(isDescending) {
        isDescending = descend(parent.left) || descend(parent.right) || false;
      }
      parentNode.insert(insertedPoint.key, insertedPoint.value, false);
    }

    store.dispatch({type: SET_ROOT, root: sbst});
  }
  runGreedyAlgorithm () {
    let points = this.props.bst.points;
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scaleLinear().range([widthMargin, width - widthMargin])
      .domain([d3.min(points, d => d.key) - 1, d3.max(points, d => d.key) + 1]);

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    for(var time = 1; time <= this.props.bst.maxTime; time++) {
      let satisfiedPoints = this.props.bst.runGreedyAlgorithm(time);
      let satisfyRect = geometric.selectAll('rect.satisfier')
        .data(satisfiedPoints);
      satisfyRect.enter()
        .append('rect')
        .attr('x', d => xRange(d.base.key))
        .attr('y', d => yRange(d.base.time))
        .transition()
        .duration(500)
        .attr('transform', d => {
          let satisfiedWidth = Math.abs(xRange(d.base.key) - xRange(d.satisfied.key));
          let satisfiedHeight = Math.abs(yRange(d.base.time) - yRange(d.satisfied.time));
          if(d.satisfied.key < d.base.key) {
            return 'translate(' + -satisfiedWidth
             + ',' + -satisfiedHeight + ')';
          }
          return 'translate(0,' + -satisfiedHeight + ')';
        })
        .attr('class', 'satisfier')
        .attr('stroke', 'green')
        .attr('fill', 'none')
        .attr('width', d => Math.abs(xRange(d.base.key) - xRange(d.satisfied.key)))
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
      .domain([d3.min(points, d => d.key) - 1, d3.max(points, d => d.key) + 1]);

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

    let point = geometric.selectAll('circle.point').data(points, d=> d.key + ':' + d.time);
    point.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', d => d.isSatisfier ? 'red' : 'white')
      .attr('cx', d => xRange(d.key))
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
      .attr('cx', d => xRange(d.key))
      .attr('cy', d => yRange(d.time))
      .attr('opacity', 1);

    geometric.selectAll('rect.satisfier')
      .attr('transform', d => {
        let satisfiedWidth = Math.abs(xRange(d.base.key) - xRange(d.satisfied.key));
        let satisfiedHeight = Math.abs(xRange(d.base.time) - xRange(d.satisfied.time));
        if(d.satisfied.key < d.base.key) {
          return 'translate(' + -satisfiedWidth
           + ',' + -satisfiedHeight + ')';
        }
        return 'translate(0,' + -satisfiedHeight + ')';
      })
      .attr('class', 'satisfier')
      .attr('stroke', 'green')
      .attr('fill', 'none')
      .attr('width', d => Math.abs(xRange(d.base.key) - xRange(d.satisfied.key)))
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
