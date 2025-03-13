import { createGlobalStyle } from 'styled-components';
import colors from './colors';

const GlobalStyles = createGlobalStyle`
  /* 폰트 설정 */
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
    background-color: ${colors.neutral.background};
    color: ${colors.text.primary};
    line-height: 1.5;
    overflow-x: hidden;
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    position: relative;
  }
  
  /* 링크 스타일 */
  a {
    color: ${colors.functional.link};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.primary.dark};
    }
  }
  
  /* 버튼 기본 스타일 초기화 */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    
    &:focus {
      outline: none;
    }
  }
  
  /* 입력 필드 기본 스타일 초기화 */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    
    &:focus {
      outline: none;
    }
  }
  
  /* 이미지 최대 너비 설정 */
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* 리스트 스타일 제거 */
  ul, ol {
    list-style: none;
  }
  
  /* 헤더 스타일 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.5em;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
  
  h3 {
    font-size: 1.5rem;
  }
  
  h4 {
    font-size: 1.25rem;
  }
  
  h5 {
    font-size: 1.125rem;
  }
  
  h6 {
    font-size: 1rem;
  }
  
  /* 단락 스타일 */
  p {
    margin-bottom: 1rem;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.neutral.lightGray};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.darkGray};
  }
`;

export default GlobalStyles;