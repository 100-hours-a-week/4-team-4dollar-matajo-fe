import { css } from 'styled-components';

// 색상 팔레트
export const colors = {
  primary: '#3835FD',
  primaryLight: '#F5F5FF',
  black: '#464646',
  darkGray: '#61646B',
  mediumGray: '#5C5757',
  lightGray: '#EFEFF0',
  white: '#FFFFFF',
  red: '#FF4B4B',
};

// 폰트 크기
export const fontSizes = {
  xs: '11px',
  sm: '13px',
  md: '15px',
  lg: '18px',
  xl: '24px',
};
// 장치 크기
export const deviceSizes = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
};

// 미디어 쿼리 헬퍼
export const device = {
  mobile: `@media screen and (max-width: ${deviceSizes.mobile})`,
  tablet: `@media screen and (max-width: ${deviceSizes.tablet})`,
  desktop: `@media screen and (min-width: ${deviceSizes.desktop})`,
};

// 공통 스타일
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// 테마 객체
const theme = {
  colors,
  fontSizes,
  deviceSizes,
  device,
  flexCenter,
  flexColumn,
};

export default theme;
