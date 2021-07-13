import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

declare global
{

  interface Window
  {
    cpuInfoFuncs: Function,
    displayInfoFuncs: Function,
    ramInfoFuncs: Function,
    osInfoFuncs: Function,
    computerInfoFuncs: Function,
    RefInt: Function,
    RefuInt: Function,
    RegistDll: Function,
    RefChr: Function,
    RefShort: Function,
    AllocInt: Function,
    PTR: Function,
    PTRu: Function,
    PTRc: Function,
    PTRshort: Function,
    StrBuilder: Function,
    showError : Function,
    boardFuncs: Function,
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
