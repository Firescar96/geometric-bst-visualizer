class MinHeap {
  constructor (criteria) {
    this.criteria = criteria;
    this.length = 0;
    this.queue = [];
  }
  insert (value) {
    this.queue.push(value);
    this.length++;
    this.bubbleUp(this.length - 1);
  }
  peek () {
    return this.queue[0];
  }
  pop () {
    var oldRoot = this.queue[0];
    var newRoot = this.queue.pop();
    this.length--;
    this.queue[0] = newRoot;
    this._fixHeap(0);
    return oldRoot;
  }
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
  _fixHeap (value) {
    let left = this.getLeftIndex(value);
    let right = this.getRightIndex(value);

    if(this.evaluate(left, value)) {
      this.swap(value, left);
      this._fixHeap(left);
    }else if(this.evaluate(right, value)) {
      this.swap(value, right);
      this._fixHeap(right);
    }else if(value === 0) {
      return;
    }else {
      this._fixHeap(0);
    }
  }
  swap (self, target) {
    var placeHolder = this.queue[self];
    this.queue[self] = this.queue[target];
    this.queue[target] = placeHolder;
  }
  evaluate (self, target) {
    if(this.queue[target] === null || this.queue[self] === null) {
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
