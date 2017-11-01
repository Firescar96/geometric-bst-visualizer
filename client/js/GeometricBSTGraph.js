import React from 'react';
import { connect } from 'react-redux';
import Point from './GeometricBSTPoint';
import {store} from './main.js';

class GeometricBSTGraph extends React.Component {
  constructor () {
    super();
    this.state = {
      points: [],
      newElement: '',
    };
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
  }
  standardBSTUpdate (test) {
    let state = store.getState();
    this.addPoint(state.newElement);
  }
  addPoint (_newElement) {
    let newElement = new Point(_newElement, this.state.points.length + 1);
    this.setState({
      newElement: '',
      points: this.state.points.concat(newElement),
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

  render () {
    return (
      <div>
        <form onSubmit={this.insertElement}>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button type="submit">Insert</button>
        </form>
        <svg id="geometric" className="graph"></svg>
      </div>
    );
  }

  update () {
    console.log(this.state.points);
    let geometric = d3.select('#geometric');
    let width = geometric.node().getBoundingClientRect().width;
    let widthMargin = width / 10;
    let height = geometric.node().getBoundingClientRect().height;
    let heightMargin = height / 3;
    console.log('translate(0,' + (height - heightMargin) + ')');

    console.log(height);
    let xRange = d3.scaleLinear().range([widthMargin, width - widthMargin])
      .domain([d3.min(this.state.points, d => d.value) - 1, d3.max(this.state.points, d => d.value) + 1]);

    let yRange = d3.scaleLinear().range([heightMargin, height - heightMargin])
      .domain([d3.max(this.state.points, d => d.time) + 1, d3.min(this.state.points, d => d.time) - 1]);

    let xAxis = d3.axisBottom(xRange)
      .ticks(this.state.points.length);
    let yAxis = d3.axisLeft(yRange);

    //geometric.remove('g.xAxis');
    geometric.selectAll('g.xAxis')
      .call(xAxis);

    //geometric.remove('g.yAxis');
    geometric.selectAll('g.yAxis')
      .call(yAxis);

    let point = geometric.selectAll('circle.point').data(this.state.points);
    point.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('stroke', 'white')
      .attr('cx', d => xRange(d.value))
      .attr('cy', d => yRange(d.time))
      .attr('r', 5);
    point.exit().remove();
    point.transition()
      .duration(200)
      .ease(v => d3.easeSinIn(v))
      .attr('cx', d => xRange(d.value))
      .attr('cy', d => yRange(d.time));
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