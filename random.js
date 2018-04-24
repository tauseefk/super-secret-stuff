'use strict';

random = (min = 0, max = 1, n = 1) => {
  let arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1) + min));
  }
  return arr;
}

fiveLarge = (arr) => {
  var largeArr = [];
  var lastLarge = 0;
  while (largeArr.length < 5) {
    var maxIdx = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[maxIdx] < arr[i]) {
        maxIdx = i;
      }
    }
    largeArr.push(maxIdx);
    if (largeArr.length === 5) {
      lastLarge = arr[maxIdx];
    }
    arr[maxIdx] = 0;
  }
  while (arr.indexOf(lastLarge) > -1) {
    var indexOfLarge = arr.indexOf(lastLarge);
    arr[indexOfLarge] = 0;
    largeArr.push(indexOfLarge);
  }

  return largeArr;
}

incorrectAsync = () => {
  for (var i = 0; i < 10; i++) {
    setTimeout(function () {
      // Running some asynchronous tasks here
      // ...
      console.log("completed task id " + i);
    }, 1000) // the loop executes ten times synchronously
    // and sets 10 timeouts for 1 second,
    // but as they are set at the same time,
    // they execute together i.e. 1 second after the execution of this loop
    // provided the stack was empty
  }
}

correctAsync = () => {
  for (var i = 0; i < 10; i++) {
    setTimeout(function () {
      // Running some asynchronous tasks here
      // ...
      console.log("completed task id " + i);
    }, 1000 * i) // this would set 10 timeouts but at increments of 1 second
    // they will execute at 1 second, then the next one at 2 seconds, and so on,
    // provided the stack was empty
  }
}

delay = (ms) => {
  return function (res) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve(res); // this would make sure that the data can be piped if needed
      }, ms);
    });
  }
}
oneSecDelay = delay(1000);

readableAsync = () => {
  var pr = Promise.resolve();
  for (var i = 0; i < 10; i++) {
    pr = pr
      .then(oneSecDelay)
      .then(() => {
        // Running some asynchronous tasks here
        // ...
      });
  }
}

export default random;