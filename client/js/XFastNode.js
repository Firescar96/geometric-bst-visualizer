//Tree View of a vEB tree, specificallly an x-fast tree which doesn't store missing values
class Node {
  constructor (bitvector, id, prefix) {
    //prefix is a value sent from the parent that should be added when this node displays it's value
    this.prefix = prefix || 0;
    this.bitvector = bitvector; //the bits this node represents
    this.id = id || '0';

    //the normal left and right children of a tree`
    this.left = this.right = null;

    //if the tree has no direct left or right child these point to the appropriate leaf on each side of the tree
    this.leftDescendant = this.rightDescendant = null;

    if(bitvector.length == 1) {
      this.isLeaf = true;
    }else {
      let leftVector = bitvector.slice(0, bitvector.length / 2);
      let rightVector = bitvector.slice(bitvector.length / 2);
      if(leftVector.includes(1)) {
        this.left = new Node(leftVector, this.id + '0', this.prefix);
        this.left.parent = this;
      }
      if(rightVector.includes(1)) {
        this.right = new Node(rightVector, this.id + '1', this.prefix + this.bitvector.length / 2);
        this.right.parent = this;
      }
      if(!this.left && this.right)this.leftDescendant = this.right.getLeftmostChild();
      if(!this.right && this.left)this.rightDescendant = this.left.getRightmostChild();
    }
  }

  //traverses the tree from the top down to get every element
  traversal () {
    var elements = [];
    elements.push(this);
    if(this.left !== null) elements.push(...this.left.traversal());
    if(this.right !== null) elements.push(...this.right.traversal());

    return elements;
  }

  //returns the path from the value in question at the leaf of the tree up to the root
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
    return ancestors;

  }

  //gets the leaf representing this nodes leftmost child
  getLeftmostChild () {
    if(this.bitvector.length == 1)return this;
    if(this.left)return this.left.getLeftmostChild();
    return this.leftDescendant;
  }

  //gets the leaf representing this nodes rightmost child
  getRightmostChild () {
    if(this.bitvector.length == 1)return this;
    if(this.right)return this.right.getRightmostChild();
    return this.rightDescendant;
  }
}

export default Node;
