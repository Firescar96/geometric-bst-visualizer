class Node {
  constructor (bits) {
    // vEB tree constructed upon initialization
    // bits is 2^n for some integer n
    // this implementation stores neither the min nor the max recursively
    this.bits = bits;
    this.size = Math.pow(2,bits);
    if (this.bits == 1) {
      this.cluster = [0,0];
      this.summary = null;
    } else {
      this.cluster = [];
      for (let i = 0; i < Math.pow(2,bits/2); i++) {
        this.cluster.push(new Node(bits/2));
      }
      this.summary = new Node(bits/2);
    }
    this.min = null;
    this.max = null;
  }

  // searches for a key, returns true if it exists
  search (key) {
    if (this.bits == 1) {
      return Boolean(this.cluster[key]);
    } else if (key < this.min || key > this.max) {
      return false;
    } else if (key == this.min || key == this.max) {
      return true;
    } else {
      let highBits = key >> this.bits/2;
      let lowBits = key & ((1 << this.bits/2) - 1)
      return this.cluster[highBits].search(lowBits);
    }
  }

  // inserts a key
  insert (key) {
    if (this.bits == 1) {
      this.cluster[key] = 1
      if (this.min === null || key < this.min) {
        this.min = key;
      }
      if (this.max === null || key > this.max) {
        this.max = key;
      }
    } else if (this.min === null) {
      this.min = key;
      this.max = key;
    } else {
      let highBits = key >> this.bits/2;
      let lowBits = key & ((1 << this.bits/2) - 1);
      if (key < this.min) {
        let nextLevelInsert = this.min;
        this.min = key;
        highBits = nextLevelInsert >> this.bits/2;
        lowBits = nextLevelInsert & ((1 << this.bits/2) - 1);
      } else if (key > this.max) {
        let nextLevelInsert = this.max;
        this.max = key;
        highBits = nextLevelInsert >> this.bits/2;
        lowBits = nextLevelInsert & ((1 << this.bits/2) - 1);
      }
      if (this.cluster[highBits].min === null) {
        this.summary.insert(highBits);
      }
      this.cluster[highBits].insert(lowBits);
    }
  }

  // deletes a key
  delete_ (key) {
    if (this.bits == 1) {
      this.cluster[key] = 0;
      if (this.cluster[1-key] == 0) {
        this.min = null;
        this.max = null;
      } else if (key == 0) {
        this.min = 1;
      } else {
        this.max = 0;
      }
    } else if (key == this.min) {
      let newHighBits = this.summary.min;
      if (newHighBits == null) {
        this.min = null;
        this.max = null;
        return;
      }
      let highBits = key >> this.bits/2;
      // TODO: work out
  }

  // finds successor of a key, if any
  succ (key) {
    if (this.min === null) {
      return null;
    } else if (key >= this.max) {
      return null;
    } else if (this.size == 2) {
      if (this.cluster[1] == 0) {
        return null;
      } else if (key == 0) {
        return 1;
      }
    }
    if (key < this.min) {
      return this.min;
    } else {
      let highBits = key >> this.bits/2;
      let lowBits = key & ((1 << this.bits/2) - 1);
      if (lowBits < this.cluster[highBits].max) {
        return (highBits << this.bits/2) + this.cluster[highBits].succ(lowBits);
      } else {
        console.log('DEBUG INFO:');
        console.log(this.summary.min);
        console.log(this.summary.max);
        let newHighBits = this.summary.succ(highBits);
        if (newHighBits === null && highBits < (this.max >> this.bits/2)) {
          newHighBits = this.max >> this.bits/2;
        }
        console.log(newHighBits);
        console.log(this.cluster.length);
        return (newHighBits << this.bits/2) + this.cluster[newHighBits].min;
      }
    }
  }

  // finds predecessor of a key, if any
  pred (key) {
    if (this.max === null) {
      return null;
    } else if (this.size == 2) {
      if (this.cluster[0] == 0) {
        return null;
      } else if (key == 1) {
        return 0;
      }
    }
    if (key > this.max) {
      return this.max;
    } else {
      let highBits = key >> this.bits/2;
      let lowBits = key & ((1 << this.bits/2) - 1);
      if (lowBits < this.cluster[highBits].min) {
        return (highBits << this.bits/2) + this.cluster[highBits].pred(highBits);
      } else {
        let newHighBits = this.summary.pred(highBits);
        return (newHighBits << this.bits/2) + this.cluster[newHighBits].max;
      }
    }

  }
}

function timingTests(){
  console.time('a');
  let vEB4 = new Node(4);
  console.timeEnd('a');
  console.time('b');
  let vEB8 = new Node(8);
  console.timeEnd('b');
  console.time('c');
  let vEB16 = new Node(16);
  console.timeEnd('c');
  console.time('d');
  let vEB32 = new Node(32);
  console.timeEnd('d');
  console.time('a');
  vEB4.insert(14);
  console.timeEnd('a');
  console.time('b');
  vEB8.insert(185);
  console.timeEnd('b');
  console.time('c');
  vEB16.insert(874);
  console.timeEnd('c');
  console.time('d');
  vEB32.insert(150743);
  console.timeEnd('d');
  console.time('a');
  vEB4.search(14);
  console.timeEnd('a');
  console.time('b');
  vEB8.search(185);
  console.timeEnd('b');
  console.time('c');
  vEB16.search(874);
  console.timeEnd('c');
  console.time('d');
  vEB32.search(150743);
  console.timeEnd('d');
}

module.exports = Node;
