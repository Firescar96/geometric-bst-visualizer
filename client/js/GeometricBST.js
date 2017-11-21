class Point {
  constructor (key, value, time, satisfier = false) {
    this.key = key;
    this.value = value;
    this.time = time;
    this.isSatisfier = satisfier; //used in the greedy algorithm, points inserted for satisfiability need not be satisfied
  }
}

class GemetricBST {
  constructor () {
    this.points = [];
    this.maxTime = 0;
    window.bst = this;
  }

  insert (key, value) {
    if(key instanceof Point) {
      this.points.push(key);
      this.maxTime = Math.max(this.maxTime, key.time);
    }else {
      let newElement = new Point(key, value, this.maxTime + 1);
      this.points.push(newElement);
      this.maxTime++;
    }
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
    //for efficiency precompute the maximum time access for all values
    let maxSubset = {};
    //for efficiency precompute all the times that a value was accessed
    let valueSets = {};
    //for efficiency reasons we only need to compare to a value once, even if it has been
    //touched in multiple timesteps
    for(var i = subset.length - 1; i >= 0; i--) {
      if(!maxSubset[subset[i].value] || subset[i].value > maxSubset[subset[i].value]) {
        maxSubset[subset[i].value] = subset[i];
      }
      if(!valueSets[subset[i].value]) {
        valueSets[subset[i].value] = [subset[i].time];
      }else {
        valueSets[subset[i].value].push(subset[i].time);
      }
    }
    maxSubset = Object.keys(maxSubset).map(x => maxSubset[x]).filter(x => x.time < time);

    //for the given time get the touched points that need satisfaction and satisfy them
    let agenda = subset.filter(x => x.time == time);
    let levelValues = agenda.map(x => x.value);
    let satisfiedPoints = [];

    let satisfy = (unsatisfiedPoint, levelPoint) => {
      if(unsatisfiedPoint === null)return;

      //this checks if there are satisfying points along the bottom segment of the
      //satisfiability box
      let rangeMin = Math.min(unsatisfiedPoint.value, levelPoint.value);
      let rangeMax = Math.max(unsatisfiedPoint.value, levelPoint.value);
      let valueSetsKeys = Object.keys(valueSets);
      for(let i = 0; i < valueSetsKeys.length; i++) {
        if(i < rangeMin)continue;
        if(i > rangeMax)break;
        if(i == unsatisfiedPoint.value)continue;
        if(!valueSets[i])continue;
        if(valueSets[i].includes(unsatisfiedPoint.time))return;
      }
      //this checks if there are satisfying points along the top segment of the
      //satisfiability box
      let isTopSatisfied;
      if(unsatisfiedPoint.value < levelPoint.value) {
        isTopSatisfied = levelValues.filter(x => x < rangeMax && x >= rangeMin).length > 0;
      }else {
        isTopSatisfied = levelValues.filter(x => x <= rangeMax && x > rangeMin).length > 0;
      }
      if(isTopSatisfied)return;

      let satisfier = new Point(unsatisfiedPoint.key, unsatisfiedPoint.value, levelPoint.time, true);
      this.points.push(satisfier);
      agenda.push(satisfier);
      levelValues.push(satisfier.value);
      valueSets[satisfier.value].push(satisfier.time);
      maxSubset = maxSubset.filter(x => x.value !== satisfier.value);
      satisfiedPoints.push({base: unsatisfiedPoint, satisfied: levelPoint});
    };
    let count = 0;
    while(agenda.length > 0 && count < 5) {
      count++;
      let levelPoint = agenda.pop();
      //this checks for satisfiability along the vertical segment below the levelPoint
      //by definition of max subset there are no points above each of these
      //so we don't have to check the other vertical segment
      let unsatisfiedPoints = maxSubset.filter(x => !valueSets[levelPoint.value].includes(x.time));
      let minmax = null;
      let maxmin = null;
      for(let unsatIndex = 0; unsatIndex < unsatisfiedPoints.length; unsatIndex++) {
        let unsatPoint = unsatisfiedPoints[unsatIndex];
        if(unsatPoint.value > levelPoint.value &&
          (minmax === null || unsatPoint.value < minmax.value)) {
          minmax = unsatPoint;
        }
        if(unsatPoint.value < levelPoint.value  &&
          (maxmin === null || unsatPoint.value > maxmin.value)) {
          maxmin = unsatPoint;
        }
      }
      satisfy(minmax, levelPoint);
      satisfy(maxmin, levelPoint);
    }
    return satisfiedPoints;
  }
}

export {Point};
export default GemetricBST;
