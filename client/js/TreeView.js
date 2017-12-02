class Node {
  constructor (bitvector) {
    this.bitvector = bitvector;
    if(bitvector.length == 1) {
      this.value = bitvector[0];
      this.left = this.right = null;
    }else {
      this.left = new Node(bitvector.slice(0, bitvector.length / 2));
      this.right = new Node(bitvector.slice(bitvector.length / 2));
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
}

export default Node;
