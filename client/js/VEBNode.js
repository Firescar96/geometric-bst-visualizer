class Node {
  constructor (bits) {
    //vEB tree constructed upon initialization
    //bits is 2^n for some integer n
    //this implementation stores neither the min nor the max recursively
    this.bits = bits;
    this.size = Math.pow(2, bits);
    if(this.bits == 1) {
      this.cluster = [0, 0];
      this.summary = null;
    }else {
      this.cluster = [];
      for(let i = 0; i < Math.pow(2, bits / 2); i++) {
        this.cluster.push(new Node(bits / 2));
      }
      this.summary = new Node(bits / 2);
    }
    this.min = null;
    this.max = null;
  }

  //searches for a key, returns true if it exists
  search (key) {
    if(this.bits == 1) {
      return Boolean(this.cluster[key]);
    }else if(key < this.min || key >this.max) {
      return false;
    }else if(key == this.min || key == this.max) {
      return true;
    }
    let highBits = key >> this.bits / 2;
    let lowBits = key & ((1 << this.bits / 2) - 1);
    return this.cluster[highBits].search(lowBits);

  }

  //inserts a key
  //TODO: don't reinsert repeated keys
  insert (key) {
    if(this.bits == 1) {
      this.cluster[key] = 1;
      if(this.min === null || key < this.min) {
        this.min = key;
      }
      if(this.max === null || key > this.max) {
        this.max = key;
      }
    }else if(this.min === null) {
      this.min = key;
      this.max = key;
    }else {
      let highBits = key >> this.bits / 2;
      let lowBits = key & ((1 << this.bits / 2) - 1);
      if(key < this.min) {
        let nextLevelInsert = this.min;
        this.min = key;
        highBits = nextLevelInsert >> this.bits / 2;
        lowBits = nextLevelInsert & ((1 << this.bits / 2) - 1);
      }else if(key > this.max) {
        let nextLevelInsert = this.max;
        this.max = key;
        highBits = nextLevelInsert >> this.bits / 2;
        lowBits = nextLevelInsert & ((1 << this.bits / 2) - 1);
      }
      console.log(this.cluster, highBits);
      if(this.cluster[highBits].min === null) {
        this.summary.insert(highBits);
      }
      this.cluster[highBits].insert(lowBits);
    }
  }

  //deletes a key
  delete_ (key) {
    if(this.bits == 1) {
      this.cluster[key] = 0;
      if(this.cluster[1 - key] == 0) {
        this.min = null;
        this.max = null;
      }else if(key == 0) {
        this.min = 1;
      }else {
        this.max = 0;
      }
    }else if(key == this.min) {
      let newHighBits = this.summary.min;
      if(newHighBits == null) {
        this.min = null;
        this.max = null;
        return;
      }
      let highBits = key >> this.bits / 2;
      //TODO: work out
    }
  }

  //finds successor of a key, if any
  succ (key) {
    if(this.min === null) {
      return null;
    }else if(key >= this.max) {
      return null;
    }else if(this.size == 2) {
      if(this.cluster[1] == 0) {
        return null;
      }else if(key == 0) {
        return 1;
      }
    }
    if(key < this.min) {
      return this.min;
    }
    let highBits = key >> this.bits / 2;
    let lowBits = key & ((1 << this.bits / 2) - 1);
    if(lowBits < this.cluster[highBits].max) {
      return (highBits << this.bits / 2) + this.cluster[highBits].succ(lowBits);
    }
    console.log('DEBUG INFO:');
    console.log(this.summary.min);
    console.log(this.summary.max);
    let newHighBits = this.summary.succ(highBits);
    if(newHighBits === null && highBits < (this.max >> this.bits / 2)) {
      newHighBits = this.max >> this.bits / 2;
    }
    console.log(newHighBits);
    console.log(this.cluster.length);
    return (newHighBits << this.bits / 2) + this.cluster[newHighBits].min;


  }

  //finds predecessor of a key, if any
  pred (key) {
    if(this.max === null) {
      return null;
    }else if(this.size == 2) {
      if(this.cluster[0] == 0) {
        return null;
      }else if(key == 1) {
        return 0;
      }
    }
    if(key > this.max) {
      return this.max;
    }
    let highBits = key >> this.bits / 2;
    let lowBits = key & ((1 << this.bits / 2) - 1);
    if(lowBits < this.cluster[highBits].min) {
      return (highBits << this.bits / 2) + this.cluster[highBits].pred(highBits);
    }
    let newHighBits = this.summary.pred(highBits);
    return (newHighBits << this.bits / 2) + this.cluster[newHighBits].max;



  }

  //TODO include min and max in bitvector
  bitvector (highbits, vector) {
    highbits = highbits || 0;
    vector = vector || new Array(this.size).fill(0);
    if(this.min !== null) vector[highbits | this.min] = 1;
    if(this.max !== null) vector[highbits | this.max] = 1;
    if(this.summary) {
      let summaryBitvector = this.summary.bitvector();
      for(var i = 0; i < summaryBitvector.length; i++) {
        if(summaryBitvector[i]) {
          this.cluster[i].bitvector(highbits | (i << this.bits / 2), vector);
        }
      }
    }

    return vector;
  }
}

module.exports = Node;
