'use strict';
var recStartTime = null;
var playStartTime = null;
var eventsQueue = [];
var playableRec = [];
var play = false;
var cursor = null;
var currentEvent = null;

document.addEventListener('DOMContentLoaded', (e) => {
  cursor = document.querySelector('#cursor');
  document.querySelector('#fetch').addEventListener('click', fetchUserEvents);

  if (document.querySelector('#record')) {
    document.querySelector('#record').addEventListener('click', () => {
      play = false;
      eventsQueue = [];
      document.addEventListener('drag', pushEventToQueue);
      document.addEventListener('mouseup', pushEventToQueue);
      document.addEventListener('mousemove', pushEventToQueue);
      document.addEventListener('click', pushEventToQueue);
      recStartTime = Date.now();
    });
  }

  document.querySelector('#play').addEventListener('click', (e) => {
    play = true;
    playableRec = [...eventsQueue];
    playStartTime = Date.now();
    requestAnimationFrame(draw);
  });
});

var fetchUserEvents = () => {
  let userId = document.querySelector('#userId').value;

  if (userId.trim() === "") return;
  axios.get(`/getUserEventsByUserId/${userId}`)
    .then(response => {
      if (response.status && response.status === 200) {
        eventsQueue = response.data;
        recStartTime = eventsQueue[0].timestamp;
      }
    });
}

var pushEventToQueue = (e) => {
  eventsQueue.push({
    type: e.type,
    pageX: e.pageX,
    pageY: e.pageY,
    timestamp: Date.now()
  });
}
var draw = () => {
  document.removeEventListener('mousemove', pushEventToQueue);
  document.removeEventListener('drag', pushEventToQueue);
  document.removeEventListener('mouseup', pushEventToQueue);
  document.removeEventListener('click', pushEventToQueue);

  if (!playableRec.length) return;

  let time = Date.now() - playStartTime;
  currentEvent = playableRec[0];
  let eventPlayTime = (currentEvent.timestamp - recStartTime);

  if (time >= eventPlayTime) {
    playableRec.shift();
    simulateEvent(currentEvent);
  }

  if (playableRec.length) {
    requestAnimationFrame(draw);
  }
}

var simulateEvent = (event) => {
  if (event.type === 'click'
    || event.type === 'mousedown'
    || event.type === 'mousemove'
    || event.type === 'drag') {
    cursor.style.top = `${event.pageY}px`;
    cursor.style.left = `${event.pageX}px`;
  }

  if (event.type === 'click'
    || event.type === 'mousedown'
    || event.type === 'mouseup') {
    cursor.classList.remove('animation-ripple');
    cursor.classList.add('animation-ripple');
    cursor.classList.remove('ripple-stay');

    if (event.target !== null) { // assuming that the target has id for simplicity
      document.querySelector(`#${event.target.id}`).click(); // XXX:TODO get id from eventTarget
    }

  } else if (event.type === 'drag') {
    cursor.classList.remove('animation-ripple');
    cursor.classList.add('ripple-stay');
  } else {
    cursor.classList.remove('animation-ripple');
  }
}
