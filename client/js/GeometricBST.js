import {lessThanComparator} from './main';

class Point {
  constructor (key, time, satisfier = false) {
    this.key = key;
    this.time = time;
    this.isSatisfier = satisfier; //used in the greedy algorithm, points inserted for satisfiability need not be satisfied
    this.delay = 0;
  }
}

class GemetricBST {
  constructor () {
    this.points = [];
    this.maxTime = 1;
    //optimization, if we have already satified points up to this time there is no need to check
    this.maxSatisfiedTime = 1;
    //for display purposes need to track how many points created each iteration of greedy algorithm
    this.numIterationSatisfiers = 0;
    this.lastTouched = null; //needed for d3 to hightlight the most recent point
  }

  insert (key) {
    if(key instanceof Point) {
      this.points.push(key);
      this.maxTime = key.isSatisfier ? this.maxTime : Math.max(this.maxTime, key.time + 1);
      this.lastTouched = key;
    }else {
      let newElement = new Point(key, this.maxTime);
      this.points.push(newElement);
      this.maxTime++;
      this.lastTouched = newElement;
    }
  }
  //takes an optional parameter for what subset of times (0 - maxTime) to look at
  runGreedyAlgorithm (maxTime) {
    this.numIterationSatisfiers = 0;
    this.points.sort((a, b) => a.time < b.time ? -1 : 1);
    if(maxTime === undefined) {
      let satisfierRects = [];
      //iterate over the points from the bottom up
      for(var time = this.maxSatisfiedTime; time <= this.maxTime; time++) {
        satisfierRects.push(...this.satisfyLevel(time));
      }
      this.maxSatisfiedTime = this.maxTime;
      return satisfierRects;
    }
    //if(maxTime <= this.maxSatisfiedTime)return [];
    //this.maxSatisfiedTime = maxTime;
    //return this.satisfyLevel(maxTime);

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
      if(!maxSubset[subset[i].key] || (subset[i].time > maxSubset[subset[i].key].time)) {
        maxSubset[subset[i].key] = subset[i];
      }
      if(!valueSets[subset[i].key]) {
        valueSets[subset[i].key] = [subset[i].time];
      }else {
        valueSets[subset[i].key].push(subset[i].time);
      }
    }
    maxSubset = Object.keys(maxSubset).map(x => maxSubset[x]).filter(x => x.time < time);
    //for the given time get the touched points that need satisfaction and satisfy them
    let agenda = subset.filter(x => x.time == time);
    let levelValues = agenda.map(x => x.key);
    let satisfiedPoints = [];

    let satisfy = (unsatisfiedPoint, levelPoint) => {
      if(unsatisfiedPoint === null)return;
      //this checks if there are satisfying points along the bottom segment of the
      //satisfiability box
      let rangeMin = lessThanComparator(unsatisfiedPoint.key, levelPoint.key) ? unsatisfiedPoint.key : levelPoint.key;
      let rangeMax = lessThanComparator(levelPoint.key, unsatisfiedPoint.key) ? unsatisfiedPoint.key : levelPoint.key;
      let valueSetsKeys = Object.keys(valueSets);

      for(let valueSetIdx = 0; valueSetIdx < valueSetsKeys.length; valueSetIdx++) {
        let valueSetVal = valueSetsKeys[valueSetIdx];
        if(lessThanComparator(valueSetVal, rangeMin))continue;
        if(lessThanComparator(rangeMax, valueSetVal))break;
        if(valueSetVal == unsatisfiedPoint.key)continue;
        if(!valueSets[valueSetVal])continue;
        if(valueSets[valueSetVal].includes(unsatisfiedPoint.time))return;
      }
      //this checks if there are satisfying points along the top segment of the
      //satisfiability box
      let isTopSatisfied;
      if(lessThanComparator(unsatisfiedPoint.key, levelValues.key)) {
        isTopSatisfied = levelValues.filter(x => x < rangeMax && x >= rangeMin).length > 0;
      }else {
        isTopSatisfied = levelValues.filter(x => x <= rangeMax && x > rangeMin).length > 0;
      }
      if(isTopSatisfied)return;

      let satisfier = new Point(unsatisfiedPoint.key, levelPoint.time, true);
      satisfier.delay = this.numIterationSatisfiers;
      this.numIterationSatisfiers++;
      this.points.push(satisfier);
      agenda.push(satisfier);
      levelValues.push(satisfier.key);
      valueSets[satisfier.key].push(satisfier.time);
      maxSubset = maxSubset.filter(x => x.key !== satisfier.key);
      satisfiedPoints.push({base: unsatisfiedPoint, satisfied: levelPoint, satisfier: satisfier});
    };

    while(agenda.length > 0) {
      let levelPoint = agenda.pop();
      //this checks for satisfiability along the vertical segment below the levelPoint
      //by definition of max subset there are no points above each of these
      //so we don't have to check the other vertical segment
      let unsatisfiedPoints = maxSubset.filter(x => !valueSets[levelPoint.key].includes(x.time));
      let minmax = null;
      let maxmin = null;
      for(let unsatIndex = 0; unsatIndex < unsatisfiedPoints.length; unsatIndex++) {
        let unsatPoint = unsatisfiedPoints[unsatIndex];
        if(lessThanComparator(levelPoint.key, unsatPoint.key) &&
          (minmax === null || lessThanComparator(unsatPoint.key, minmax.key))) {
          minmax = unsatPoint;
        }
        if(lessThanComparator(unsatPoint.key, levelPoint.key) &&
          (maxmin === null || lessThanComparator(maxmin.key, unsatPoint.key))) {
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
