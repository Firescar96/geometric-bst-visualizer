import React from 'react';

class Navbar extends React.Component {
  render () {
    return (
      <nav >
        <ul>
          <li><a href="#/">Binary Search Tree</a></li>
          <li><a href="#/veb">X-fast Tree</a></li>
          <li id="github"><a href="https://github.com/Firescar96/geometric-bst-visualizer">
            <img src="./public/images/GitHub-Mark-Light-32px.png"></img>
            <span>Source</span>
          </a></li>
        </ul>
      </nav>);
  }
}

export default Navbar;
