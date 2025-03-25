import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('메인 레이아웃이 정상적으로 렌더링되는지 확인', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  // MainRedirect 컴포넌트로 인해 /main으로 리다이렉트됨
  expect(window.location.pathname).toBe('/main');
});
