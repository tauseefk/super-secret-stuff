'use strict';
const buttonStates = ['blue', 'red', 'yellow'];
const socket = io.connect('http://localhost:5000/');

let getRandomColor = () => {
  return buttonStates[Math.floor(Math.random() * 3)];
}

document.addEventListener('DOMContentLoaded', (e) => {
  let testButton = document.querySelector('#testButton');
  let testResult = {
    status: "passed",
    reason: "everything looks good!",
    timestamp: new Date()
  }
  testButton.addEventListener('click', (e) => {
    let targetColor = getRandomColor();
    e.target.style.backgroundColor = targetColor;
    if (e.target.style.backgroundColor === 'yellow') {
      e.target.style.color = 'black';
    } else {
      e.target.style.color = 'white';
    }
    if (currentEvent && currentEvent.target && currentEvent.target.color && currentEvent.target.color !== targetColor) {
      testResult.status = "failed";
      testResult.reason = "button state isn't changing as expected.";
    }
    socket.emit('newTest', testResult);
  });
});
