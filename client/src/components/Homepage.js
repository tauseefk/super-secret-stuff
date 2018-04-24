import React, { Component } from 'react';
import axios from 'axios';

export default class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonState: 0,
      eventsQueue: []
    };
    this._buttonStates = ['blue', 'red', 'yellow', 'red'];
  }

  handleButtonClick = (e) => {
    let event = {
      timestamp: Date.now(),
      target: {
        id: 'testButton',
        color: this._buttonStates[this.state.buttonState]
      },
      type: 'click',
      pageX: e.pageX,
      pageY: e.pageY,
      saved: 'not saved'
    }
    this.setState(prevProps => {
      return {
        buttonState: (prevProps.buttonState + 1) % 4,
        eventsQueue: prevProps.eventsQueue.concat(event)
      }
    });

    if (this._requestTimer) {
      window.clearTimeout(this._requestTimer); // debounce save requests
    }
    this._requestTimer = setTimeout(this.sendRequest.bind(undefined, e), 2000);
  }

  sendRequest = () => {
    // fire event save request to backend
    let eventsInQueue = this.state.eventsQueue.map(e => {
      e.saved = 'saving';
      return e;
    });
    this.setState(prevProps => {
      return { eventsQueue: eventsInQueue }
    })
    axios.post('/saveEvents',
      {
        id: this.props.userId,
        events: eventsInQueue
      }) // TODO: replace with axios request
      .then(res => {
        if (res.status && res.status === 200) {
          let updatedQueue = this.state.eventsQueue.filter(e => {
            return e.saved !== 'saving' // removing events saved in this round
          });
          this.setState(prevProps => {
            return { eventsQueue: updatedQueue };
          })
        }
      })
      .catch(e => {
        this.setState(prevProps => {
          return {
            eventsQueue: prevProps.eventsQueue.filter(events => {
              return events.saved !== 'saving' // removing events saved in this round
            })
          };
        });
        window.alert('Event data too large, deleting queue!');
      });
  }

  render() {
    return (
      <div id='page'>
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
          <Button color={this._buttonStates[this.state.buttonState]} handleClick={this.handleButtonClick} />
        </div>
      </div>
    )
  }
};

const Button = ({ color, handleClick }) => {
  return (
    <button id='testButton' onMouseDown={handleClick} style={{ margin: '50px auto', outline: 'none', backgroundColor: color, color: color === 'yellow' ? 'black' : 'white' }} className='btn'>Giant Button</button>
  )
};
