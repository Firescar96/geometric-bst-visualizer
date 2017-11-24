import React from 'react';
import { connect } from 'react-redux';
import *as d3 from 'd3';
import BST from './GeometricBST';
import Node from './StandardBSTNode';
import {store} from './main';
import MinHeap from './MinHeap';
import {ADD_POINT, SET_ROOT, CLEAR_POINTS} from './constants';

function geometricBSTReducer (state, action) {
  if(state === undefined) {
    return {
      root: new BST(),
      nonce: 0,
    };
  }

  switch (action.type) {
    case ADD_POINT:
      if(action.point !== undefined) {
        state.root.insert(action.point);
      }else if(action.newElement !== undefined) {
        let newElement = isNaN(action.newElement) ?
          parseInt(action.newElement.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) :
          parseFloat(action.newElement);
        state.root.insert(newElement, action.newElement);
      }
      return Object.assign({}, state, {
        nonce: ++state.nonce,
      });
    case CLEAR_POINTS:
      return Object.assign({}, state, {
        root: new BST(),
        nonce: ++state.nonce,
      });
    default:
      return state;
  }
}

class GeometricBSTGraph extends React.Component {
  constructor (props) {
    super(props);
    this.runGreedyAlgorithm = this.runGreedyAlgorithm.bind(this);
    this.makeStandardBst = this.makeStandardBst.bind(this);
  }
  makeStandardBst () {
    //this is a prerequisite
    this.runGreedyAlgorithm();
    //create a min heap on the points
    let heap = new MinHeap('time');
    this.props.root.points.forEach(point => {
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
      for(var i = 0; i < heap.queue.length; i++) {
        if(heap.queue[i].key == parentNode.key) {
          break;
        }
        if(heap.queue[i].key == insertedPoint.key) {
          if(parentNode.key < insertedPoint.key) {
            parentNode.rotateLeft();
          }else if(parentNode.key > insertedPoint.key) {
            parentNode.rotateRight();
          }
          break;
        }
      }
    }

    store.dispatch({type: SET_ROOT, root: sbst});
  }
  runGreedyAlgorithm () {
    let points = this.props.root.points;
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scalePoint().range([widthMargin, width - widthMargin])
      .domain(points.map(x => (x.key)));

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    for(var time = 1; time <= this.props.root.maxTime; time++) {
      let satisfiedPoints = this.props.root.runGreedyAlgorithm(time);
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
    }
    this.componentDidUpdate();
  }
  render () {
    return (
      <div>
        <button type="button" onClick={this.runGreedyAlgorithm}>Run Greedy Algorithm</button>
        <button onClick={this.makeStandardBst}>Make Standard BST</button>
        <svg id="geometric" className="graph"></svg>
      </div>
    );
  }
  componentDidUpdate () {
    let points = this.props.root.points.sort((a, b) => {
      if(isNaN(a.key)) {
        return a.key.localeCompare(b.key);
      }else if(isNaN(b.key)) {
        return -1 * b.key.localeCompare(a.key);
      }
      return a.key <= b.key ? -1 : 1;
    });
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scalePoint().range([widthMargin, width - widthMargin])
      .domain(points.map(x => (x.key)));
    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    let xAxis = d3.axisBottom(xRange)
      .tickFormat((d, i) => points[i].value);
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
      .attr('stroke', 'none')
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
      .attr('transform', 'translate(0,' + (height - heightMargin) + ')');

    geometric.append('g')
      .attr('class', 'yAxis')
      .attr('transform', 'translate(' + (widthMargin) + ',0)');

    let yLabelX = widthMargin - 40;
    let yLabelY = height / 2;
    geometric.append('text')
      .attr('x', yLabelX)
      .attr('y', yLabelY)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('letter-spacing', 1.5)
      .attr('stroke', 'white')
      .attr('fill', 'white')
      .attr('transform', 'rotate(-90 , ' + yLabelX + ',' + yLabelY + ')')
      .text('insert time');

    geometric.append('text')
      .attr('x', width / 2)
      .attr('y', height - heightMargin + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('letter-spacing', 1.5)
      .attr('stroke', 'white')
      .attr('fill', 'white')
      .text('value');
  }
}

export default connect(function (state, ownProps) {
  return {
    root: state.geometricBST.root,
    nonce: state.geometricBST.nonce,
  };
})(GeometricBSTGraph);

export {geometricBSTReducer};
