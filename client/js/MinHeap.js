import {lessThanComparator} from './main';
class MinHeap {
  constructor (criteria) {
    this.criteria = criteria;
    this.queue = [];
    window.heap = this;
  }

  //returns true if the heap isn't empty
  hasNext () {
    return this.queue.length > 0;
  }

  //inserts a new value into the queue and rebalances
  insert (value) {
    this.queue.push(value);
    this.bubbleUp(this.queue.length - 1);
  }

  //peek at the next element in the heap
  peek () {
    return this.queue[0];
  }

  //retrieve the next element in the heap and rebalance
  pop () {
    var oldRoot = this.queue[0];
    this.queue[0] =  this.queue[this.queue.length - 1];
    this.queue[this.queue.length - 1] = oldRoot;
    this.queue.pop();
    this._fixHeap(0);
    return oldRoot;
  }

  //bubbleup fixes the heap by rearraging items from the bottom up
  bubbleUp (index) {
    if(index === 0) {
      return;
    }
    var parent = this.getParentIndex(index);
    if(this.evaluate(index, parent)) {
      this.swap(index, parent);
      this.bubbleUp(parent);
    }else {
      return;
    }
  }

  //compares the elements at an index's right and left children and swaps if necessary
  _fixHeap (value) {
    let left = this.getLeftIndex(value);
    let right = this.getRightIndex(value);

    if(this.evaluate(left, value)) {
      this.swap(value, left);
      this._fixHeap(left);
    }
    if(this.evaluate(right, value)) {
      this.swap(value, right);
      this._fixHeap(right);
    }
  }

  //performs the swap
  swap (self, target) {
    var placeHolder = this.queue[self];
    this.queue[self] = this.queue[target];
    this.queue[target] = placeHolder;
  }

  //uses the specified criteria key to compare two values
  evaluate (self, target) {
    if(this.queue[target] === undefined || this.queue[self] === undefined) {
      return false;
    }
    return lessThanComparator(this.queue[self][this.criteria], this.queue[target][this.criteria]);

  }

  //helper functions to do math
  getParentIndex (index) {
    return Math.floor((index - 1) / 2);
  }
  getLeftIndex (index) {
    return index * 2 + 1;
  }
  getRightIndex (index) {
    return index * 2 + 2;
  }
}

export default MinHeap;
