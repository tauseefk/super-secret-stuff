'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = document.querySelector('#dashboard');
  const socket = io.connect('http://localhost:5000/');

  socket.on('newTestDisplay', (data) => {
    let testResult = document.createElement('div');
    testResult.textContent = data.data.timestamp;
    if (data.data.status === 'failed') {
      testResult.style.color = 'red';
      testResult.textContent += ' Test failed: ';
    } else {
      testResult.style.color = 'green';
      testResult.textContent += ' Test passed: ';
    }
    testResult.textContent += data.data.reason;
    dashboard.appendChild(testResult);
    dashboard.children[dashboard.children.length - 1].scrollIntoView();
  });
  socket.on('disconnect', () => { });

});

