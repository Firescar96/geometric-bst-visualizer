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
        state.root.insert(action.newElement, action.newElement);
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
    let heightMargin = height / 5;

    let xDomainIdxs = points.map(x => (x.key)).map((x, i, a) => a.indexOf(x)).filter((x, i, a) => a.indexOf(x) == i);
    let xRange = d3.scalePoint().range([widthMargin, width - widthMargin])
    //the domain is over all keys, pruning for duplicates
      .domain(xDomainIdxs.map(x => points[x].key))
      .padding(1);
    let yDomain = points.map(d => d.time).filter((x, i, a) => a.indexOf(x) == i).sort((a, b) => a < b ? 1 : -1);
    let yRange = d3.scalePoint().range([heightMargin, height - heightMargin])
      .domain(yDomain)
      .padding(1);
    let satisfierRects = this.props.root.runGreedyAlgorithm();
    let satisfyRect = geometric.selectAll('rect.satisfier')
      .data(satisfierRects);
    satisfyRect.enter()
      .append('rect')
      .attr('x', d => xRange(d.base.key))
      .attr('y', d => yRange(d.base.time))
      .transition()
      .delay(d => 500 * d.satisfier.delay)
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
      .delay(500)
      .remove();
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
      let lessThan = (isNaN(a.key) && a.key.localeCompare(b.key) < 0 ) || (!isNaN(a.key) && isNaN(b.key)) || a.key < b.key;
      return lessThan ? -1 : 1;
    });
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 5;

    let xDomainIdxs = points.map(x => (x.key)).map((x, i, a) => a.indexOf(x)).filter((x, i, a) => a.indexOf(x) == i);
    let xRange = d3.scalePoint().range([widthMargin, width - widthMargin])
    //the domain is over all keys, pruning for duplicates
      .domain(xDomainIdxs.map(x => points[x].key))
      .padding(1);
    let yDomain = points.map(d => d.time).filter((x, i, a) => a.indexOf(x) == i).sort((a, b) => a < b ? 1 : -1);
    let yRange = d3.scalePoint().range([heightMargin, height - heightMargin])
      .domain(yDomain)
      .padding(1);

    let xAxis = d3.axisBottom(xRange)
      .tickFormat((d, i) => points[xDomainIdxs[i]].value);
    let yAxis = d3.axisLeft(yRange);

    geometric.selectAll('g.xAxis')
      .call(xAxis);

    geometric.selectAll('g.yAxis')
      .call(yAxis);

    let point = geometric.selectAll('circle.point').data(points, d=> d.key + ':' + d.time);
    point.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', (d, i) => d.isSatisfier ? 'red' : d == this.props.root.lastTouched ? 'green' : 'white')
      .attr('cx', d => xRange(d.key))
      .attr('cy', d => yRange(d.time))
      .attr('r', 5)
      .attr('stroke', 'none')
      .attr('opacity', d => d.isSatisfier ? 0 : 1)
      .transition()
      .duration(200)
      .delay(d => d.isSatisfier ? 500 * (d.delay + 1) : 0)
      .attr('opacity', 1);
    point.exit().remove();
    point.transition()
      .duration(200)
      .ease(v => d3.easeSinIn(v))
      .attr('fill', (d, i) => d.isSatisfier ? 'red' : d == this.props.root.lastTouched ? 'green' : 'white')
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
    let heightMargin = height / 5;


    let xRange = d3.scalePoint().range([widthMargin, width - widthMargin]);
    let yRange = d3.scalePoint().range([heightMargin, height - heightMargin]);
    let xAxis = d3.axisBottom(xRange);
    let yAxis = d3.axisLeft(yRange);

    geometric.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(0,' + (height - heightMargin) + ')')
      .call(xAxis);

    geometric.append('g')
      .attr('class', 'yAxis')
      .attr('transform', 'translate(' + (widthMargin) + ',0)')
      .call(yAxis);

    geometric.selectAll('g.xAxis')
      .call(xAxis);

    geometric.selectAll('g.yAxis')
      .call(yAxis);

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
