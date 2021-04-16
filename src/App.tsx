import React from 'react';
import logo from './logo.svg';
import './App.css';
import DraggableDialog from './DraggableDialog';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <DraggableDialog />
      </header>
    </div>
  );
}

export default App;
