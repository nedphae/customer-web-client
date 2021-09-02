import React from 'react';
import logo from './logo.svg';
// import './App.css';
import DraggableDialog from './DraggableDialog';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  App: {
    position: 'fixed',
    height: '80px',
    width: '80px',
    right: '10px',
    textAlign: 'center',
    bottom: '40%',
    zIndex: 9999,
  },
  AppHeader: {
    height: '80px',
    width: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.App}> { /* <div className="App"> */ }
      <header className={classes.AppHeader}> { /** <header className="App-header"> */}
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <DraggableDialog />
      </header>
    </div>
  );
}

export default App;
