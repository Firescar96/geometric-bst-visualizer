//BST balanced by height
class Node {
  constructor (key, parent) {
    this.parent = parent;
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
  }

  //inserts a key and rebalances
  insert (key) {
    console.log('insert', key, this);
    if(key < this.key) {
      this.numLeftChildren++;
      if(this.left === null) {
        this.left = new Node(key, this);
      }else {
        this.left.insert(key);
      }
      this.height = Math.max(this.height, 1 + this.left.height);
    }
    if(key >= this.key) {
      this.numRightChildren++;
      if(this.right === null) {
        this.right = new Node(key, this);
      }else {
        this.right.insert(key);
      }
      this.height = Math.max(this.height, 1 + this.right.height);
    }

    this.rebalance();
  }

  //this is done a little strangely so that the pointer to the root node never
  //changes, instead the children are moved and keys are switched
  rebalance () {
    console.log('rebalancing', this);
    var leftNode = this.left;
    var rightNode = this.right;

    if((this.numLeftChildren > 1 && this.numRightChildren == 0) ||
      (this.numLeftChildren > 0 && this.numRightChildren > 0 && leftNode.height > rightNode.height + 1)
    ) {
      if((leftNode.numLeftChildren > 0 && leftNode.numRightChildren == 0) ||
        (leftNode.numLeftChildren > 0 && leftNode.numRightChildren > 0 && leftNode.left.height > leftNode.right.height)
        //^maybe not necessary
      ) {
        //extra value is on the outside -> single rotation
        this.rotateRight();
      }else {
        //extra value is on the inside -> double rotation
        leftNode.rotateLeft();
        this.rotateRight();
      }
    }
    else if((this.numRightChildren > 1 && this.numLeftChildren == 0) ||
      (this.numLeftChildren > 0 && this.numRightChildren > 0 && rightNode.height > leftNode.height + 1)
    ) {
      if((rightNode.numRightChildren > 0 && rightNode.numLeftChildren == 0) ||
        (rightNode.numLeftChildren > 0 && rightNode.numRightChildren > 0 && rightNode.right.height > rightNode.left.height)
      ) {
        //extra value is on the outside -> single rotation
        this.rotateLeft();
      }else {
        //extra value is on the inside -> double rotation
        rightNode.rotateRight();
        this.rotateLeft();
      }
    }
    //
    // this.updateDepth();
    // this.updateHeight();
  }

  // updateDepth () {
  //   if(this.parent !== undefined)this.depth = this.parent.depth + 1;
  //   if(this.numLeftChildren > 0)this.left.updateDepth();
  //   if(this.numRightChildren > 0)this.right.updateDepth();
  // }
  //
  // updateHeight () {
  //   if(this.parent === undefined)this.height = treeHeight;
  //   else this.height = this.parent.height - 1;
  //   if(this.numLeftChildren > 0)this.left.updateHeight();
  //   if(this.numRightChildren > 0)this.right.updateHeight();
  // }

  //move counterclockwise
  rotateLeft () {
    console.log('rotate left', this);
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
    console.log('rotate right', this);
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

  traversal () {
    var elements = [];
    if(this.left !== null) elements.push(...this.left.traversal());
    elements.push(this);
    if(this.right !== null) elements.push(...this.right.traversal());

    return elements;
  }

  find (key) {
    if(key == this.key) {
      return this;
    }else if(key < this.key) {
      return this.numLeftChildren > 0 ? this.left.find(key) : null;
    }

    return this.numRightChildren > 0 ? this.right.find(key) : null;
  }
}

export default Node;
