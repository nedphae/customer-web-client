import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const myDiv = document.createElement("div");
document.body.appendChild(myDiv)

export const initChat = () => {
  ReactDOM.render(
    // <React.StrictMode>
      <App />,
    // </React.StrictMode>,
    myDiv // document.getElementById('root')
  );
}
window.initChat = initChat
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
