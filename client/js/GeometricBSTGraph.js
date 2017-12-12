import React from 'react';
import { connect } from 'react-redux';
import *as d3 from 'd3';
import BST from './GeometricBST';
import Node from './StandardBSTNode';
import {store, lessThanComparator} from './main';
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
        state.root.insert(action.newElement);
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
    this.satisfierRects = [];
    this.xRange = null;
    this.yRange = null;
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
    let sbst = new Node(rootPoint.key);
    let accessSequence = [{key: rootPoint.key, isAncestor: false}];
    while(heap.hasNext() > 0) {
      //get all the touchedPoints for a particular access time
      let parentNode = sbst;
      let accessTime = heap.peek().time;
      let touchedPoints = [];
      let insertedPoint = null;
      while(heap.peek() !== undefined && heap.peek().time === accessTime) {
        let point = heap.pop();
        if(point.isSatisfier) {
          touchedPoints.push(point.key); '';
        }else {
          insertedPoint = point;
        }
      }

      //accessSequence.push({key: parentNode.key, isAncestor: true});
      //use the touchedPoints to figure out where to insert the insertedPoint
      let isDescending = true;
      let descend = (node) => {
        if(node === null)return false;
        parentNode = node;
        //accessSequence.push({key: node.key, isAncestor: true});
        return true;
      };
      while(isDescending) {
        if(insertedPoint.key == parentNode.key)break;

        let touchedIndex = touchedPoints.indexOf(parentNode.key);
        let isLeft = lessThanComparator(insertedPoint.key, parentNode.key);
        console.log(touchedPoints, touchedIndex);
        if(touchedIndex == -1) {
          if(isLeft) parentNode.rotateRight();
          else parentNode.rotateLeft();
          continue;
        }else {
          touchedPoints.splice(touchedIndex, 1);
        }
        if(isLeft) {
          isDescending = descend(parentNode.left);
        }else {
          isDescending = descend(parentNode.right);
        }
      }
      sbst.insert(insertedPoint.key, false, accessSequence);

      for(var i = 0; i < heap.queue.length; i++) {

        if(heap.queue[i].key == parentNode.key) {
          break;
        }
        if(heap.queue[i].key == insertedPoint.key) {
          if(lessThanComparator(parentNode.key, insertedPoint.key)) {
            parentNode.rotateLeft();
          }else if(lessThanComparator(insertedPoint.key, parentNode.key)) {
            parentNode.rotateRight();
          }
          break;
        }
      }
      //parentNode.insert(insertedPoint.key, false, accessSequence);
      //accessSequence.push({key: insertedPoint.key, isAncestor: false});
    }
    sbst.syncAttributes();
    store.dispatch({type: SET_ROOT, root: sbst, accessSequence});
  }
  runGreedyAlgorithm () {
    let geometric = d3.select('#geometric');

    this.satisfierRects.push(...this.props.root.runGreedyAlgorithm());
    this.componentDidUpdate();
  }
  render () {
    return (
      <div>
        <button type="button" onClick={this.runGreedyAlgorithm}>Run Greedy Algorithm</button>
        <button onClick={this.makeStandardBst}>Generate Standard View</button>
        <svg id="geometric" className="graph"></svg>
      </div>
    );
  }
  componentDidUpdate () {
    let thisReact = this;
    let points = this.props.root.points.sort((a, b) => {
      return lessThanComparator(a.key, b.key) ? -1 : 1;
    });
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 5;

    let xDomainIdxs = points.map(x => String(x.key)).map((x, i, a) => a.indexOf(x)).filter((x, i, a) => a.indexOf(x) == i);
    this.xRange = d3.scalePoint().range([widthMargin, width - widthMargin])
    //the domain is over all keys, pruning for duplicates
      .domain(xDomainIdxs.map(x => points[x].key))
      .padding(1);
    let yDomain = points.map(d => d.time).filter((x, i, a) => a.indexOf(x) == i).sort((a, b) => a < b ? 1 : -1);
    this.yRange = d3.scalePoint().range([heightMargin, height - heightMargin])
      .domain(yDomain)
      .padding(1);

    let xAxis = d3.axisBottom(this.xRange)
      .tickFormat((d, i) => points[xDomainIdxs[i]].key);
    let yAxis = d3.axisLeft(this.yRange);

    geometric.selectAll('g.xAxis')
      .call(xAxis);

    geometric.selectAll('g.yAxis')
      .call(yAxis);

    let point = geometric.selectAll('circle.point').data(points, d=> d.key + ':' + d.time + ':'  + d.isSatisfier);
    point.enter()
      .append('circle')
      .attr('class', 'point invisible')
      .attr('fill', (d, i) => d.isSatisfier ? 'red' : d == this.props.root.lastTouched ? 'green' : 'white')
      .attr('cx', d => this.xRange(d.key))
      .attr('cy', d => this.yRange(d.time))
      .attr('r', 5)
      .attr('stroke', 'none')
      .attr('opacity', d => d.isSatisfier ? 0 : 1)
      .transition()
      .duration(500)
      .delay(d => d.isSatisfier ? 500 * (d.delay + 1) : 0)
      .on('end', function () {
        d3.select(this).transition()
          .duration(500)
          .ease(v => d3.easeSinIn(v))
          .attr('class', 'point visible')
          .attr('opacity', 1)
          .ease(v => d3.easeSinIn(v))
          .attr('fill', (d, i) => d.isSatisfier ? 'red' : d == thisReact.props.root.lastTouched ? 'green' : 'white')
          .attr('cx', d => thisReact.xRange(d.key))
          .attr('cy', d => thisReact.yRange(d.time));
      });
    point.exit().remove();
    geometric.selectAll('circle.point.invisible')
      .attr('cx', d => this.xRange(d.key))
      .attr('cy', d => this.yRange(d.time));
    geometric.selectAll('circle.point.visible').transition()
      .duration(500)
      .ease(v => d3.easeSinIn(v))
      .attr('opacity', 1)
      .attr('fill', (d, i) => d.isSatisfier ? 'red' : d == this.props.root.lastTouched ? 'green' : 'white')
      .attr('cx', d => this.xRange(d.key))
      .attr('cy', d => this.yRange(d.time));

    let satisfyRect = geometric.selectAll('rect.satisfier').data(this.satisfierRects);
    satisfyRect.enter()
      .append('rect')
      .attr('class', 'satisfier invisible')
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('opacity', 0)
      .transition()
      .delay(d => 500 * d.satisfier.delay)
      .attr('opacity', 1)
      .on('end', function () {
        d3.select(this)
          .attr('class', 'satisfier visible').transition()
          .duration(500)
          .attr('x', d => thisReact.xRange(d.base.key))
          .attr('y', d => thisReact.yRange(d.base.time))
          .attr('transform', d => {
            let satisfiedWidth = Math.abs(thisReact.xRange(d.base.key) - thisReact.xRange(d.satisfied.key));
            let satisfiedHeight = Math.abs(thisReact.yRange(d.base.time) - thisReact.yRange(d.satisfied.time));
            if(thisReact.xRange(d.base.key) > thisReact.xRange(d.satisfied.key)) {
              return 'translate(' + -satisfiedWidth
                       + ',' + -satisfiedHeight + ')';
            }
            return 'translate(0,' + -satisfiedHeight + ')';
          })
          .attr('width', d => Math.abs(thisReact.xRange(d.base.key) - thisReact.xRange(d.satisfied.key)))
          .attr('height', d => Math.abs(thisReact.yRange(d.base.time) - thisReact.yRange(d.satisfied.time)))
          .transition()
          .delay(500)
          .attr('opacity', 0);
      });

    geometric.selectAll('rect.satisfier.invisible')
      .attr('x', d => this.xRange(d.base.key))
      .attr('y', d => this.yRange(d.base.time));

    geometric.selectAll('rect.satisfier.visible')
      .transition()
      .duration(500)
      .attr('x', d => this.xRange(d.base.key))
      .attr('y', d => this.yRange(d.base.time))
      .attr('transform', d => {
        let satisfiedWidth = Math.abs(this.xRange(d.base.key) - this.xRange(d.satisfied.key));
        let satisfiedHeight = Math.abs(this.yRange(d.base.time) - this.yRange(d.satisfied.time));
        if(this.xRange(d.base.key) > this.xRange(d.satisfied.key)) {
          return 'translate(' + -satisfiedWidth
                   + ',' + -satisfiedHeight + ')';
        }
        return 'translate(0,' + -satisfiedHeight + ')';
      })
      .attr('width', d => Math.abs(this.xRange(d.base.key) - this.xRange(d.satisfied.key)))
      .attr('height', d => Math.abs(this.yRange(d.base.time) - this.yRange(d.satisfied.time)))
      .transition()
      .delay(500)
      .attr('opacity', 0);
  }

  componentDidMount () {
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 5;


    this.xRange = d3.scalePoint().range([widthMargin, width - widthMargin]);
    this.yRange = d3.scalePoint().range([heightMargin, height - heightMargin]);
    let xAxis = d3.axisBottom(this.xRange);
    let yAxis = d3.axisLeft(this.yRange);

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
