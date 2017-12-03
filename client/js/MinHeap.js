class MinHeap {
  constructor (criteria) {
    this.criteria = criteria;
    this.queue = [];
    window.heap = this;
  }
  hasNext () {
    return this.queue.length > 0;
  }
  insert (value) {
    this.queue.push(value);
    console.log('bubble up', value);
    this.bubbleUp(this.queue.length - 1);
    //if(this.queue.length > 1 && )
  }
  peek () {
    return this.queue[0];
  }
  pop () {
    console.log(this.queue.map(x => x));
    var oldRoot = this.queue[0];
    this.queue[0] =  this.queue[this.queue.length - 1];
    this.queue[this.queue.length - 1] = oldRoot;
    this.queue.pop();
    this._fixHeap(0);
    return oldRoot;
  }
  bubbleUp (index) {
    if(index === 0) {
      return;
    }
    var parent = this.getParentIndex(index);
    console.log('parent', parent, index, this.evaluate(index, parent));
    if(this.evaluate(index, parent)) {
      console.log('swapping', parent, index);
      this.swap(index, parent);
      this.bubbleUp(parent);
    }else {
      return;
    }
  }
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
  swap (self, target) {
    var placeHolder = this.queue[self];
    this.queue[self] = this.queue[target];
    this.queue[target] = placeHolder;
  }
  evaluate (self, target) {
    if(this.queue[target] === undefined || this.queue[self] === undefined) {
      return false;
    }
    return (this.queue[self][this.criteria] < this.queue[target][this.criteria]);

  }
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
