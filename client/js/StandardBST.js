class Node {
  constructor (key, parent) {
    this.parent = parent;
    this.left = null;
    this.right = null;
    this.key = key;
    this.numLeftChildren = 0;
    this.numRightChildren = 0;
  }

  //inserts a key and rebalances
  insert (key) {
    if(key < this.key) {
      this.numLeftChildren++;
      if(this.left === null) {
        this.left = new Node(key, this);
      }else {
        this.left.insert(key);
      }
    }
    if(key >= this.key) {
      this.numRightChildren++;
      if(this.right === null) {
        this.right = new Node(key, this);
      }else {
        this.right.insert(key);
      }
    }

    this.rebalance();
  }

  //this is done a little strangely so that the pointer to the root node never
  //changes, instead the children are moved and keys are switched
  rebalance () {
    var leftNode = this.left;
    var rightNode = this.right;
    console.log("rebalance", this);
    if(this.numLeftChildren < 2 && this.numRightChildren < 2)return;

    if(this.numLeftChildren > this.numRightChildren + 1) {
      if(leftNode.numLeftChildren >= leftNode.numRightChildren) {
        //extra value is on the outside -> single rotation
        this.rotateRight();
      }else {
      //extra value is on the inside -> double rotation
        leftNode.rotateLeft();
        this.rotateRight();
      }
    }
    if(this.numRightChildren > this.numLeftChildren + 1) {
      if(rightNode.numRightChildren >= rightNode.numLeftChildren) {
        //extra value is on the outside -> single rotation
        this.rotateLeft();
      }else {
        //extra value is on the inside -> double rotation
        rightNode.rotateRight();
        this.rotateLeft();
      }
    }
  }

  //move counterclockwise
  rotateLeft () {
    var leftNode = this.left;
    var rightNode = this.right;
    //extra value is on the outside -> single rotation
    this.right = rightNode.right;
    this.numRightChildren--;
    rightNode.right = rightNode.left;
    rightNode.numRightChildren = rightNode.numLeftChildren;
    rightNode.left = this.left;
    rightNode.numLeftChildren = this.numLeftChildren;
    this.left = rightNode;
    this.numLeftChildren++;

    var temp = this.key;
    this.key = rightNode.key;
    rightNode.key = temp;
  }

  //move clockwise
  rotateRight () {
    var leftNode = this.left;
    var rightNode = this.right;
    this.left = leftNode.left;
    this.numLeftChildren--;
    leftNode.left = leftNode.right;
    leftNode.numLeftChildren = leftNode.numRightChildren;
    leftNode.right = this.right;
    leftNode.numRightChildren = this.numRightChildren;
    this.right = leftNode;
    this.numRightChildren++;

    var temp = this.key;
    this.key = leftNode.key;
    leftNode.key = temp;
  }

  traversal () {
    var elements = [];
    if(this.left !== null) elements.push(...this.left.traversal());
    elements.push(this.key);
    if(this.right !== null) elements.push(...this.right.traversal());

    return elements;
  }
}

export default Node;
