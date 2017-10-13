import React from 'react';
import StandardBST from './StandardBST';
require('../sass/home.scss');
window.StandardBST = StandardBST;

class Home extends React.Component {
  constructor () {
    super();
    this.state = {newElement: ''};
    this.insertElement = this.insertElement.bind(this);
  }
  insertElement (event) {
    this.setState({newElement: event.target.value});
  }
  render () {
    return (
      <div>
        <main>
          <label>
            Insert an element
            <input value={this.state.newElement} onChange={this.insertElement}></input>
            <button>Insert</button>
          </label>
          <svg id="standard">

          </svg>
          <svg id="geometric">

          </svg>
        </main>

      </div>
    );
  }

  componentDidRender () {
    var standard = d3.select('#standard')

    var geometric = d3.select('#geometric')
  }
}

export default Home;
