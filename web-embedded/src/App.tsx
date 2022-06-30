import React, { useState } from 'react';
import logo from './logo.svg';
// import './App.css';
import DraggableDialog, { DraggableDialogProps } from './DraggableDialog';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  App: {
    position: 'fixed',
    // height: '60px',
    // width: '60px',
    right: '5px',
    textAlign: 'center',
    zIndex: 9999,
  },
  AppHeader: {
    // height: '60px',
    // width: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
});

function App(accessParamProp: DraggableDialogProps) {
  const { accessParam, customerHost, styleDIY } = accessParamProp
  const classes = useStyles();

  return (
    <>
      <div className={classes.App} style={{ bottom: styleDIY?.buttonPosition ?? '5%' }}> { /* <div className="App"> */}
        <div className={classes.AppHeader}> { /** <header className="App-header"> */}
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <DraggableDialog accessParam={accessParam} customerHost={customerHost} styleDIY={styleDIY} />
        </div>
      </div>
    </>

  );
}

export default App;
