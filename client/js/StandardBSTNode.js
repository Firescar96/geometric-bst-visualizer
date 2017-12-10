import {lessThanComparator} from './main';

//BST balanced by height
class Node {
  constructor (key, parent) {
    this.parent = parent || null;
    this.left = null;
    this.right = null;
    this.key = key;
    this.numLeftChildren = 0;
    this.numRightChildren = 0;
    this.height = 0;
    this.depth = 0;
    this.id = '' + Math.random(); //used to uniquely identify nodes when displaying with d3
    this.x = 0;  //used by d3 to represent the x position of the element
    this.y = 0; //used by d3 to represent the y position of the element
    this.lastTouched = this; //used by d3 to select the last touched node
  }

  //inserts a key and rebalances
  //returns number of new children
  insert (key, rebalance = true, accessSequence = []) {
    if(key == this.key) {
      this.lastTouched = this;
      accessSequence.push({key: this.key, isAncestor: false});
      return 0;
    }
    accessSequence.push({key: this.key, isAncestor: true});

    if(lessThanComparator(key, this.key)) {
      if(this.left === null) {
        this.numLeftChildren++;
        this.left = new Node(key, this);
        accessSequence.push({key, isAncestor: false});
      }else {
        this.numLeftChildren += this.left.insert(key, rebalance, accessSequence);
      }
      this.height = Math.max(this.height, 1 + this.left.height);
      this.lastTouched = this.left.lastTouched;
    }else {
      if(this.right === null) {
        this.numRightChildren++;
        this.right = new Node(key, this);
        accessSequence.push({key, isAncestor: false});
      }else {
        this.numRightChildren += this.right.insert(key, rebalance, accessSequence);
      }
      this.height = Math.max(this.height, 1 + this.right.height);
      this.lastTouched = this.right.lastTouched;
    }

    if(rebalance) {
      this.rebalance();
    }
    return 1;
  }

  //this is done a little strangely so that the pointer to the root node never
  //changes, instead the children are moved and keys are switched
  rebalance () {
    var leftNode = this.left;
    var rightNode = this.right;

    if((this.numLeftChildren > 1 && this.numRightChildren == 0) ||
      (this.numLeftChildren > 0 && this.numRightChildren > 0 && leftNode.height > rightNode.height + 1)
    ) {
      if((leftNode.numLeftChildren > 0 && leftNode.numRightChildren == 0) ||
        (leftNode.numLeftChildren > 0 && leftNode.numRightChildren > 0 && leftNode.left.height > leftNode.right.height)
        //^maybe not necessary
      ) {
        //extra key is on the outside -> single rotation
        this.rotateRight();
      }else {
        //extra key is on the inside -> double rotation
        leftNode.rotateLeft();
        this.rotateRight();
      }
    }else if((this.numRightChildren > 1 && this.numLeftChildren == 0) ||
      (this.numLeftChildren > 0 && this.numRightChildren > 0 && rightNode.height > leftNode.height + 1)
    ) {
      if((rightNode.numRightChildren > 0 && rightNode.numLeftChildren == 0) ||
        (rightNode.numLeftChildren > 0 && rightNode.numRightChildren > 0 && rightNode.right.height > rightNode.left.height)
      ) {
        //extra key is on the outside -> single rotation
        this.rotateLeft();
      }else {
        //extra key is on the inside -> double rotation
        rightNode.rotateRight();
        this.rotateLeft();
      }
    }
  }


  //move counterclockwise
  rotateLeft () {
    var leftNode = this.left;
    var rightNode = this.right;

    if(leftNode !== null) leftNode.parent = rightNode;
    if(rightNode.right !== null) rightNode.right.parent = this;

    var temp = this.key;
    this.key = rightNode.key;
    rightNode.key = temp;

    this.right = rightNode.right;
    this.numRightChildren -= rightNode.numLeftChildren + 1;
    rightNode.right = rightNode.left;
    rightNode.numRightChildren = rightNode.numLeftChildren;
    rightNode.left = this.left;
    rightNode.numLeftChildren = this.numLeftChildren;
    this.left = rightNode;
    this.numLeftChildren += rightNode.numRightChildren + 1;

    rightNode.height = 0;
    if(rightNode.numLeftChildren > 0)rightNode.height = Math.max(rightNode.height, 1 + rightNode.left.height);
    if(rightNode.numRightChildren > 0)rightNode.height = Math.max(rightNode.height, 1 + rightNode.right.height);
    this.height = 0;
    if(this.numLeftChildren > 0)this.height = Math.max(this.height, 1 + this.left.height);
    if(this.numRightChildren > 0)this.height = Math.max(this.height, 1 + this.right.height);
  }

  //move clockwise
  rotateRight () {
    var leftNode = this.left;
    var rightNode = this.right;

    if(rightNode !== null) rightNode.parent = leftNode;
    if(leftNode.left !== null) leftNode.left.parent = this;

    var temp = this.key;
    this.key = leftNode.key;
    leftNode.key = temp;

    this.left = leftNode.left;
    this.numLeftChildren -= leftNode.numRightChildren + 1;
    leftNode.left = leftNode.right;
    leftNode.numLeftChildren = leftNode.numRightChildren;
    leftNode.right = this.right;
    leftNode.numRightChildren = this.numRightChildren;
    this.right = leftNode;
    this.numRightChildren += leftNode.numLeftChildren + 1;

    leftNode.height = 0;
    if(leftNode.numLeftChildren > 0)leftNode.height = Math.max(leftNode.height, 1 + leftNode.left.height);
    if(leftNode.numRightChildren > 0)leftNode.height = Math.max(leftNode.height, 1 + leftNode.right.height);
    this.height = 0;
    if(this.numLeftChildren > 0)this.height = Math.max(this.height, 1 + this.left.height);
    if(this.numRightChildren > 0)this.height = Math.max(this.height, 1 + this.right.height);
  }

  //in order traversal of the nodes
  traversal () {
    var elements = [];
    if(this.left !== null) elements.push(...this.left.traversal());
    elements.push(this);
    if(this.right !== null) elements.push(...this.right.traversal());

    return elements;
  }

  //traversal by each level from the root to the leaves
  levelTraversal () {
    let elements = [];
    let agenda = [this];
    while(agenda.length > 0) {
      let curElem = agenda.shift();
      elements.push(curElem);
      if(curElem.left !== null) {agenda.push(curElem.left);}
      if(curElem.right !== null) {agenda.push(curElem.right);}
    }
    return elements;
  }

  getAncestors () {
    let ancestors = [];
    let curElem = this;
    while(curElem.parent !== null) {
      curElem = curElem.parent;
      ancestors.push(curElem);
    }
    return ancestors;
  }

  find (key) {
    if(key == this.key) {
      return this;
    }else if(lessThanComparator(key, this.key)) {
      return this.numLeftChildren > 0 ? this.left.find(key) : null;
    }

    return this.numRightChildren > 0 ? this.right.find(key) : null;
  }
}

export default Node;
