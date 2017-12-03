class Node {
  constructor (bitvector, id) {
    this.bitvector = bitvector;
    this.id = id || '0';
    if(bitvector.length == 1) {
      this.value = bitvector[0];
      this.left = this.right = null;
    }else {
      this.left = new Node(bitvector.slice(0, bitvector.length / 2), this.id + '0');
      this.right = new Node(bitvector.slice(bitvector.length / 2), this.id + '1');
      this.value = this.left.value || this.right.value;
      this.left.parent = this;
      this.right.parent = this;
    }
  }
  traversal () {
    var elements = [];
    elements.push(this);
    if(this.left !== null) elements.push(...this.left.traversal());
    if(this.right !== null) elements.push(...this.right.traversal());

    return elements;
  }

  getPath (value) {
    let bits = this.bitvector.length;
    if(bits > 1) {
      let lowBits = value & ((bits / 2) - 1);
      if(value < bits / 2) {
        return this.left.getPath(lowBits);
      }
      return this.right.getPath(lowBits);
    }

    let ancestors = [];
    let curElem = this;
    while(curElem.parent !== undefined) {
      ancestors.push({source: curElem.parent, target: curElem});
      curElem = curElem.parent;
    }
    console.log(ancestors);
    return ancestors;

  }
}

export default Node;
