import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AccessParam } from './DraggableDialog';

const myDiv = document.createElement("div");
document.body.appendChild(myDiv)

export const initXiaobaiChat = (accessParam: AccessParam, customerHost: string | undefined = undefined) => {
  ReactDOM.render(
    // <React.StrictMode>
    <App accessParam={accessParam} customerHost={customerHost} />,
    // </React.StrictMode>,
    myDiv // document.getElementById('root')
  );
}
window.initXiaobaiChat = initXiaobaiChat;

// const params: AccessParam = {
//   // 接待组代码
//   sc: 'Cxl1TwUHjw',
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
// };
// initXiaobaiChat(params);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
