// src/main.tsx
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';

// 타입 오류를 방지하기 위한 타입 단언 사용
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  // JSX 요소로 명시적으로 생성하여 타입 오류 방지
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      BrowserRouter,
      null,
      React.createElement(AuthProvider, null, React.createElement(App, null)),
    ),
  ),
);

reportWebVitals();
