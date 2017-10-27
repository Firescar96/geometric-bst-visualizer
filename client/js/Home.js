import React from 'react';
import { connect } from 'react-redux';
import StandardBSTGraph from './StandardBSTGraph.js';
import GeometricBSTGraph from './GeometricBSTGraph.js';
require('../sass/home.scss');

class Home extends React.Component {
  render () {
    return (
      <main>
        <StandardBSTGraph />
        <GeometricBSTGraph />
      </main>
    );
  }
}

export default Home;
