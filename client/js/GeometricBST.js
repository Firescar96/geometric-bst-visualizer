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
    this.points.sort((a, b) => a.time < b.time ? -1 : 1);
    if(maxTime === null) {
      //iterate over the points from the bottom up
      for(var time = 1; time <= this.maxTime; time++) {
        this.satisfyLevel(time);
      }
    }else {
      return this.satisfyLevel(maxTime);
    }
  }

  satisfyLevel (time) {
    //get the points that have to be checked for satisfiability
    let subset = this.points.filter(x => x.time <= time);
    let maxSubset = {};
    //for efficiency reasons we only need to compare to a value once, even if it has been
    //touched in multiple timesteps
    for(var i = subset.length - 1; i >= 0; i--) {
      if(!maxSubset[subset[i].value]) {
        maxSubset[subset[i].value] = subset[i];
      }
    }
    subset = Object.keys(maxSubset).map(x => maxSubset[x]);

    //for the given time get the touched point that needs satisfaction
    let levelPoint = this.points.filter(x => x.time == time).filter(x => !x.isSatisfier)[0];
    let minmax = null;
    let maxmin = null;
    subset.forEach(subsetPoint => {
      if(subsetPoint.value == levelPoint.value)return;
      //place a satisfaction point adjacent to the touched point to the left and right if necessary
      if(subsetPoint.value > levelPoint.value &&
        (minmax === null || subsetPoint.value < minmax.value)) {
        minmax = subsetPoint;
      }
      if(subsetPoint.value < levelPoint.value  &&
        (maxmin === null || subsetPoint.value > maxmin.value)) {
        maxmin = subsetPoint;
      }
    });

    let satisfiedPoints = [];
    if(minmax !== null) {
      let rightSatisfier = new Point(minmax.value, levelPoint.time, true);
      this.points.push(rightSatisfier);
      satisfiedPoints.push({base: minmax, satisfied: levelPoint});
    }
    if(maxmin !== null) {
      let leftSatisfier = new Point(maxmin.value, levelPoint.time, true);
      console.log(maxmin, levelPoint);
      this.points.push(leftSatisfier);
      satisfiedPoints.push({base: maxmin, satisfied: levelPoint});
    }
    return satisfiedPoints;
  }
}


export default GemetricBST;
