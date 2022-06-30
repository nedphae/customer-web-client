import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AccessParam, StyleDIY } from './DraggableDialog';

const myDiv = document.createElement("div");
document.body.appendChild(myDiv)

export const initXiaobaiChat = (accessParam: AccessParam, styleDIY?: StyleDIY, 
  customerHost?: string
  ) => {
  ReactDOM.render(
    // <React.StrictMode>
    <App accessParam={accessParam} customerHost={customerHost} styleDIY={styleDIY}/>,
    // </React.StrictMode>,
    myDiv // document.getElementById('root')
  );
}
window.initXiaobaiChat = initXiaobaiChat;

// const params: AccessParam = {
//   // 接待组代码
//   sc: 'Ml1Q9KLP',
//   // 可空，uid，企业当前登录用户标识，不传表示匿名用户，由客服系统自动生成
//   // uid: 'my-company-uid',
//   // 可空，指定客服 Id，如果不传，则由系统自动分配客服
//   // staffId: '',
//   // 可空，指定客服组 Id
//   // groupid: '',
//   // 可空，客户名称，如果不传，则由系统自动生成，如果客服系统已经有该客户信息（uid 关联），则会忽略
//   // name: '',
//   // 可空，客户邮箱
//   // email: '',
//   // 可空，客户手机号码
//   // mobile: '',
//   // 可空，客户 Vip 等级
//   // vipLevel: '',
//   // 可空，客户当前咨询页标题
//   // title: '',
//   // 可空，客户当前咨询页
//   // referrer: '',
//   // 可空，是否展示转人工按钮，0 不展示，1 展示 不传默认展示
//   // staffSwitch: 0,
// };
// // 可空
// const styleDIY: StyleDIY = {
//   // buttonPosition 默认 '5%'
//   buttonPosition: '5%',
//   // text 默认 空
//   text: '联系客服',
//   // textColor 默认 系统button颜色
//   textColor: 'black',
//   // backgroundColor 默认 系统button背景颜色
//   backgroundColor: '#fcaf3b',
//   // 按钮图标，不传默认展示 material-icons Forum
//   // svgStr: '<svg viewBox="0 -13 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M4.278 5.108C17.561.324 43.861-5.242 73.692 9.68a106.617 106.617 0 0 1 22.126 16.374c10.467-1.891 21.248-2.846 32.192-2.846 32.754 0 63.808 8.584 87.443 24.165 12.233 8.077 21.963 17.653 28.906 28.47 7.725 12.057 11.65 25.013 11.641 38.914 0 13.52-3.916 26.494-11.65 38.543-6.943 10.826-16.674 20.393-28.906 28.47-23.626 15.58-54.68 24.155-87.444 24.155-10.944 0-21.725-.956-32.191-2.846a106.641 106.641 0 0 1-22.126 16.374c-29.842 14.922-56.131 9.356-69.414 4.563-4.364-1.575-5.702-7.113-2.484-10.444 9.368-9.7 24.867-28.88 21.057-46.314C8.032 152.089 0 133.796 0 114.386c0-19.047 8.031-37.34 22.852-52.52 3.81-17.433-11.689-36.604-21.057-46.304-3.228-3.332-1.88-8.879 2.483-10.454Zm122.395 43.631c-57.469 0-104.06 30.15-104.06 67.337 0 16.201 8.842 31.076 23.587 42.695 4.154 13.243 1.72 28.174-7.296 44.786-.43.803-.83 1.604-1.27 2.397 7.735-.64 15.556-2.769 23.472-6.654a82.432 82.432 0 0 0 16.597-12.345l8.996-8.679c12.309 3.313 25.812 5.146 39.974 5.146 57.468 0 104.059-30.14 104.068-67.346 0-37.187-46.6-67.337-104.068-67.337ZM76.882 100.6c8.47 0 15.336 6.836 15.336 15.266s-6.866 15.267-15.336 15.267-15.336-6.836-15.336-15.267c0-8.43 6.866-15.265 15.336-15.265Zm49.37 0c8.47 0 15.337 6.836 15.337 15.266s-6.867 15.267-15.336 15.267c-8.47 0-15.337-6.836-15.337-15.267 0-8.43 6.866-15.265 15.337-15.265Zm49.37 0c8.46 0 15.336 6.836 15.336 15.266s-6.866 15.267-15.335 15.267c-8.47 0-15.337-6.836-15.337-15.267 0-8.43 6.866-15.265 15.337-15.265Z" fill="#F5455C"/></svg>' 
// }
// initXiaobaiChat(params, styleDIY);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
