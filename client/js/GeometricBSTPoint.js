class Point {
  constructor (value, time) {
    this.value = isNaN(value) ? parseInt(value.split('').map(x => x.charCodeAt(0)).reduce((x, y) => x + y, '')) : parseFloat(value);
    this.time = time;
  }
}

export default Point;
