/**
 * Tailwind CSS 설정 파일
 * CreLink 지갑의 테마 시스템을 지원하기 위한 설정
 */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // 클래스 기반 다크 모드 사용
  theme: {
    extend: {
      colors: {
        // 라이트 모드 색상
        'primary': {
          light: '#338AFF',
          DEFAULT: '#0066FF',
          dark: '#0052CC',
        },
        'secondary': {
          light: '#6A50D0',
          DEFAULT: '#4D32C0',
          dark: '#3A249D',
        },
        'surface': {
          DEFAULT: '#FFFFFF',
          dark: '#F8F9FA',
        },
        'background': {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
        },
        'error': '#FF3B30',
        'success': '#34C759',
        'warning': '#FF9500',
        'info': '#0066FF',
        'text': {
          primary: '#1C1C1E',
          secondary: '#8E8E93',
          tertiary: '#C7C7CC',
          inverse: '#FFFFFF',
        },
        'border': '#E5E5EA',
        
        // 다크 모드 색상
        'dark': {
          'primary': {
            light: '#338AFF',
            DEFAULT: '#0066FF',
            dark: '#0052CC',
          },
          'secondary': {
            light: '#6A50D0',
            DEFAULT: '#4D32C0',
            dark: '#3A249D',
          },
          'surface': {
            DEFAULT: '#1C1C1E',
            light: '#2C2C2E',
          },
          'background': {
            DEFAULT: '#000000',
            card: '#1C1C1E',
          },
          'error': '#FF453A',
          'success': '#30D158',
          'warning': '#FF9F0A',
          'info': '#0A84FF',
          'text': {
            primary: '#FFFFFF',
            secondary: '#AEAEB2',
            tertiary: '#636366',
            inverse: '#1C1C1E',
          },
          'border': '#38383A',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 2px 10px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};