import React from 'react';
import { connect } from 'react-redux';
import Point from './GeometricBSTPoint';

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
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    let newElement = this.state.newElement;

    event.preventDefault();
    this.setState({
      newElement: '',
      points: this.state.points.concat(newElement),
    }, () => {
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
        <svg id="geometric" width="100%" height="100%">

        </svg>
      </div>
    );
  }

  update () {
    let geometric = d3.select('#geometric');

    let point = geometric.selectAll('circle.point').data(this.state.points);
    point.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('stroke', 'white')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', 5);
    point.exit().remove();
  }
}

export default GeometricBSTGraph;