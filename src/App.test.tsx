import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('비로그인 상태에서 로그인 페이지로 리다이렉트되는지 확인', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  // 로그인하지 않은 상태이므로 /login으로 리다이렉트됨
  expect(window.location.pathname).toBe('/login');
});
