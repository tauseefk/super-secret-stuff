import React, { PureComponent } from 'react';
import axios from 'axios';

export default class EventTracker extends PureComponent {

  constructor(props) {
    super(props);
    //set state
    this.state = {
      eventsQueue: []
    }
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
        window.alert("Event data too large, deleting queue!");
      });
  }

  addEventToQueue = (e) => {
    // add event to queue here
    this.setState(prevState => ({
      eventsQueue: prevState.eventsQueue.concat({
        saved: "not saved",
        ...e
      })
    }));
    if (this._requestTimer) {
      window.clearTimeout(this._requestTimer); // debounce save requests
    }
    this._requestTimer = setTimeout(this.sendRequest.bind(undefined, e), 2000);
  }

  componentDidMount() {
    // create userId
    axios.get('/createUser')
      .then(response => {
        if (response.status && response.status === 200) {
          this.props.updateUserId(response.data);
        }
      })
  }

  onComponentWillUnmount() {
    // save any unsaved events
  }

  render() {
    const children = this.props.children;
    var childrenWithEventCallback = React.Children.map(children, child => {
      return React.cloneElement(child, { addEventToQueue: this.addEventToQueue });
    });
    return (
      <div>
        {childrenWithEventCallback}
      </div>
    );
  }
}
