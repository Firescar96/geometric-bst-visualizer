import React from 'react';
import StandardBST from './StandardBST';
require('../sass/home.scss');
const NODE_RADIUS = 10;

class Home extends React.Component {
  constructor () {
    super();
    this.state = {
      newElement: '',
      root: null,
    };
    this.state.root = new StandardBST('99');
      this.state.root.insert('9')
      this.state.root.insert('8')
      this.state.root.insert('7')
      this.state.root.insert('6')
      this.state.root.insert('6')
      this.state.root.insert('4')
      this.state.root.insert('3')
    // root.insert('')
    // this.state.root.insert('7')
    // this.state.root.insert('9')
    // this.state.nodeList = this.state.root.traversal();
    window.root = this.state.root
    this.state.simulation = d3.forceSimulation();
    window.simulation = this.state.simulation;
    this.insertElement = this.insertElement.bind(this);
    this.changeElement = this.changeElement.bind(this);
  }
  changeElement (event) {
    this.setState({newElement: event.target.value});
  }
  insertElement (event) {
    if(this.state.root === null) {
      this.setState({
        newElement: '',
        root: new StandardBST(event.target.value)
      });
    }else {
      this.setState({newElement: ''});
      this.state.root.insert(event.target.value);
    }
    this.update();
  }
  render () {
    return (
      <main>
        <label>
          Insert an element
          <input value={this.state.newElement} onChange={this.changeElement}></input>
          <button value={this.state.newElement} onClick={this.insertElement}>Insert</button>
        </label>
        <div id="graphs">
          <svg id="standard" width="50%" height="50%">
            <g id="links"></g>
            <g id="nodes"></g>
          </svg>
          <svg id="geometric" width="50%" height="50%">

          </svg>
        </div>
      </main>
    );
  }

  componentDidMount () {
    let standard = d3.select('#standard');
    this.state.simulation
    .force('collision', d3.forceCollide().radius(NODE_RADIUS + 5))
    .force('manyBody', d3.forceManyBody().strength(1))
    // .force('order', d3.forceY().strength(-0.1))
    .on('tick', () => {
      standard.selectAll('svg.node')
      .attr('x', (d) => {
        if(d.parent !== undefined && d.parent.x !== undefined) {
          let delta = NODE_RADIUS;
          delta *= Math.pow(2, d.parent.height);
          d.x = d == d.parent.left ? d.parent.x - delta : d.parent.x + delta;
        }
        return d.x;
      })
      .attr('y', (d) => {
        if(d.parent !== undefined && d.parent.y !== undefined) {
          d.y = d.parent.y + 50;
        }
        return d.y;
      });

      this.state.root.fx = standard.node().getBoundingClientRect().width / 2;
      this.state.root.fy = standard.node().getBoundingClientRect().height / 2;

      standard.selectAll('text.node')
      .text((d) => d.key);

      standard.selectAll('line.link')
      .attr('x1', (d) => {
        return d.source.x + NODE_RADIUS
      })
      .attr('y1', (d) => d.source.y + NODE_RADIUS)
      .attr('x2', (d) => d.target.x + NODE_RADIUS)
      .attr('y2', (d) => d.target.y + NODE_RADIUS);
    });
    this.update();
  }

  update () {
    let standard = d3.select('#standard');

    function linkChildren (parent) {
      let linkList = [];
      if(parent.left !== null) {
        linkList.push({source: parent, target: parent.left});
        linkList.push(...linkChildren(parent.left));
      }
      if(parent.right !== null) {
        linkList.push({source: parent, target: parent.right});
        linkList.push(...linkChildren(parent.right));
      }
      return linkList;
    }

    let linkList = linkChildren(this.state.root);
    console.log(linkList);
    let link = standard.select('#links').selectAll('line.link').data(linkList, d => d.id + '_' + d.id);
    link
    .enter().append('line')
    .attr('class', 'link')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 5);
    link.exit().remove();

    let nodes = this.state.root.traversal();
    let node = standard.select('#nodes').selectAll('svg.node')
    .data(nodes, d => d.id);

    let nodeG = node.enter()
    .append('svg')
    .attr('class', 'node')
    .attr('width', '40')
    .attr('height', '40')

    nodeG
    .append('circle')
    .attr('class', 'node')
    .attr('stroke', 'white')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', 20)
    .text((d) => d.key);

    nodeG.exit().remove();

    nodeG
    .append('text')
    .attr('class', 'node')
    .attr('fill', 'white')
    .attr('x', '50%')
    .attr('y', '50%')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .text((d) => d.key);

    nodeG.exit().remove();

    this.state.simulation.nodes(nodes)
    .force('link', d3.forceLink(linkList).strength(.5).distance(100))
    .alpha(1)
    .restart();

    let geometric = d3.select('#geometric');
  }
}

export default Home;
