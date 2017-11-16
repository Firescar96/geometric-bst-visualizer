import React from 'react';
import { connect } from 'react-redux';
import BST from './GeometricBST';
import {store} from './main.js';

class GeometricBSTGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      bst: new BST(),
      newElement: '',
    };
    window.bst = this.state.bst;
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.runGreedyAlgorithm = this.runGreedyAlgorithm.bind(this);
  }
  standardBSTUpdate (test) {
    let state = store.getState();
    this.addPoint(state.newElement);
  }
  addPoint (_newElement) {
    this.state.bst.insert(_newElement);
    this.setState({
      newElement: '',
    }, () => {
      this.update();
    });
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    event.preventDefault();
    this.addPoint(this.state.newElement);
  }
  runGreedyAlgorithm () {
    let points = this.state.bst.points;
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;

    let xRange = d3.scaleLinear().range([widthMargin, width - widthMargin])
      .domain([d3.min(points, d => d.value) - 1, d3.max(points, d => d.value) + 1]);

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(points, d => d.time) + 1, d3.min(points, d => d.time) - 1]);

    for(var time = 1; time <= this.state.bst.maxTime; time++) {
      let satisfiedPoints = this.state.bst.runGreedyAlgorithm(time);
      let satisfyRect = geometric.selectAll('rect.satisfier')
        .data(satisfiedPoints);
      satisfyRect.enter()
        .append('rect')
        .attr('x', d => xRange(d.base.value))
        .attr('y', d => yRange(d.base.time))
        .transition()
        .duration(800)
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
    this.update();
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
        <svg id="geometric" className="graph"></svg>
      </div>
    );
  }

  update () {
    let points = this.state.bst.points;
    let nnSatisfierPoints = this.state.bst.points.filter(x => !x.isSatisfier);
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
      .delay(d => d.isSatisfier ? 900 : 0)
      .attr('opacity', 1);
    point.exit().remove();
    point.transition()
      .duration(200)
      .ease(v => d3.easeSinIn(v))
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
    store.subscribe(this.standardBSTUpdate.bind(this));
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
    root: state.root,
    numElements: state.numElements,
    newElement: null,
  };
})(GeometricBSTGraph);
