class Point {
  constructor (value, time, satisfier = false) {
    this.baseValue = value;
    this.value = isNaN(value) ?
      parseInt(value.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) :
      parseFloat(value);
    this.time = time;
    this.isSatisfier = satisfier; //used in the greedy algorithm, points inserted for satisfiability need not be satisfied
  }
}

class GemetricBST {
  constructor () {
    this.points = [];
    this.maxTime = 0;
  }

  insert (_newElement) {
    let newElement = new Point(_newElement, this.maxTime + 1);
    this.points.push(newElement);
    this.maxTime++;
  }

  //takes an optional parameter for what subset of times (0 - maxTime) to look at
  runGreedyAlgorithm (maxTime) {
    maxTime = maxTime || this.maxTime;
    //iterate over the points from the bottom up
    this.points.sort((a, b) => a.time < b.time ? -1 : 1);
    for(var time = 1; time <= maxTime; time++) {
      this.satisfyLevel(time);
    }
  }

  satisfyLevel (time) {
    console.log('satisfy ', time);
    let subset = this.points.filter(x => x.time <= time);
    let maxSubset = {};
    for(var i = subset.length - 1; i >= 0; i--) {
      if(!maxSubset[subset[i].value]) {
        maxSubset[subset[i].value] = subset[i];
      }
    }
    console.log('not max subset:', subset);
    subset = Object.keys(maxSubset).map(x => maxSubset[x]);
    let levelPoint = this.points.filter(x => x.time == time).filter(x => !x.isSatisfier)[0];
    let minmax = null;
    let maxmin = null;
    subset.forEach(subsetPoint => {
      if(subsetPoint.value == levelPoint.value)return;
      console.log('match', subsetPoint, levelPoint);
      console.log(subsetPoint.value > levelPoint.value);
      if(subsetPoint.value > levelPoint.value &&
        (minmax === null || subsetPoint.value < minmax.value)) {
        console.log('minmax');
        minmax = subsetPoint;
      }
      if(subsetPoint.value < levelPoint.value  &&
        (maxmin === null || subsetPoint.value > maxmin.value)) {
        console.log(maxmin);
        maxmin = subsetPoint;
      }
    });
    console.log('subset:', subset, minmax, maxmin);
    if(minmax !== null) {
      this.points.push(new Point(minmax.value, levelPoint.time, true));
    }
    if(maxmin !== null) {
      this.points.push(new Point(maxmin.value, levelPoint.time, true));
    }
  }
}


export default GemetricBST;
