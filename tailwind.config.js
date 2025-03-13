/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 색상
        primary: {
          main: '#6B5CFF', // 보라색 (버튼, 주요 강조 요소)
          light: '#9F94FF',
          dark: '#4A3EBF', 
          bg: '#F5F5FF', // 연한 보라색 배경
        },
        
        // 중립 색상
        neutral: {
          white: '#FFFFFF',
          bg: '#F5F6FA', // 배경색 (연한 회색)
          lightGray: '#E5E5EA', // 경계선, 구분선 
          gray: '#C7C7CC', // 비활성화된 요소
          darkGray: '#8E8E93', // 부가 텍스트
          black: '#000000',
        },
        
        // 텍스트 색상
        text: {
          primary: '#1D1D1F', // 주요 텍스트
          secondary: '#6E6E73', // 부가 텍스트
          tertiary: '#9898A1', // 힌트 텍스트
          helper: '#FF3B30', // 도움말 텍스트 (빨간색)
        },
        
        // 상태 색상
        state: {
          success: '#34C759', // 성공 (체크표시)
          warning: '#FFCC00', // 경고
          error: '#FF3B30', // 오류 (X표시)
          info: '#6B5CFF', // 정보
        },
        
        // 특정 기능 색상
        keeper: '#5368FF', // 보관인 관련
        discount: '#FF3B30', // 할인 표시
        link: '#6B5CFF', // 링크 색상

        // 카테고리 색상
        category: {
          plant: '#34C759', // 식물
          electronics: '#5368FF', // 전자기기
          furniture: '#8E8E93', // 가전/가구
          book: '#AF52DE', // 서적
          food: '#FF9500', // 식품
          sports: '#FF3B30', // 스포츠
          clothes: '#5856D6', // 의류
          hobby: '#FF2D55', // 취미
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['28px', '36px'],
        '4xl': ['36px', '40px'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}