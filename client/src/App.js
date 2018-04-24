import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Homepage from './components/Homepage';
import Ripple from './components/Ripple/Ripple'; // TODO: clean this up
import EventTracker from './components/EventTracker';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: ""
    }
  }

  handleUpdateUserId = (userId) => {
    this.setState(prevProps => {
      return {
        userId: userId
      }
    });
  }

  render() {
    return (
      <div className="App">
        <EventTracker userId={this.state.userId} updateUserId={this.handleUpdateUserId}>
          <Ripple>
            <Homepage userId={this.state.userId} />
          </Ripple>
        </EventTracker>
      </div>
    );
  }
}

export default App;
