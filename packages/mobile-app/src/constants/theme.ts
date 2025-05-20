/**
 * 앱에서 사용하는 색상 정의
 */
export const colors = {
  light: {
    // 기본 색상
    primary: '#3B82F6', // 밝은 블루 (메인 브랜드 색상)
    secondary: '#6366F1', // 인디고 (보조 색상)
    tertiary: '#8B5CF6', // 퍼플 (제3 색상)
    
    // 액센트 색상
    accent: '#F59E0B', // 주황색 (강조 색상)
    
    // 상태 색상
    success: '#10B981', // 그린 (성공)
    warning: '#F59E0B', // 앰버 (경고)
    error: '#EF4444', // 레드 (오류)
    info: '#3B82F6', // 블루 (정보)
    
    // 배경 색상
    background: '#FFFFFF', // 기본 배경
    backgroundSecondary: '#F9FAFB', // 보조 배경
    card: '#FFFFFF', // 카드 배경
    
    // 텍스트 색상
    text: '#1F2937', // 기본 텍스트
    textSecondary: '#4B5563', // 보조 텍스트
    textTertiary: '#9CA3AF', // 제3 텍스트
    
    // 테두리, 구분선 색상
    border: '#E5E7EB', // 기본 테두리
    separator: '#F3F4F6', // 구분선
    
    // 기타 색상
    ripple: 'rgba(0, 0, 0, 0.1)', // 리플 이펙트
    overlay: 'rgba(0, 0, 0, 0.5)', // 오버레이
    shadow: 'rgba(0, 0, 0, 0.1)', // 그림자
    
    // 투명도
    transparent: 'transparent',
  },
  
  dark: {
    // 기본 색상
    primary: '#60A5FA', // 조금 더 밝은 블루 (다크모드에서 더 밝게)
    secondary: '#818CF8', // 밝은 인디고
    tertiary: '#A78BFA', // 밝은 퍼플
    
    // 액센트 색상
    accent: '#FBBF24', // 밝은 주황색
    
    // 상태 색상
    success: '#34D399', // 밝은 그린
    warning: '#FBBF24', // 밝은 앰버
    error: '#F87171', // 밝은 레드
    info: '#60A5FA', // 밝은 블루
    
    // 배경 색상
    background: '#111827', // 다크 배경
    backgroundSecondary: '#1F2937', // 다크 보조 배경
    card: '#1F2937', // 다크 카드 배경
    
    // 텍스트 색상
    text: '#F9FAFB', // 다크 기본 텍스트
    textSecondary: '#E5E7EB', // 다크 보조 텍스트
    textTertiary: '#9CA3AF', // 다크 제3 텍스트
    
    // 테두리, 구분선 색상
    border: '#374151', // 다크 테두리
    separator: '#374151', // 다크 구분선
    
    // 기타 색상
    ripple: 'rgba(255, 255, 255, 0.1)', // 다크 리플
    overlay: 'rgba(0, 0, 0, 0.7)', // 다크 오버레이
    shadow: 'rgba(0, 0, 0, 0.3)', // 다크 그림자
    
    // 투명도
    transparent: 'transparent',
  },
};

/**
 * 앱에서 사용하는 크기 및 간격 정의
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * 앱에서 사용하는 폰트 크기 정의
 */
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

/**
 * 앱에서 사용하는 테두리 반경 정의
 */
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

/**
 * 앱에서 사용하는 폰트 패밀리 정의
 */
export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

/**
 * 앱에서 사용하는 그림자 스타일 정의
 */
export const shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 10,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
  },
};

/**
 * 앱에서 사용하는 레이아웃 관련 상수 정의
 */
export const layout = {
  screenPadding: 16,
  tabBarHeight: 60,
  headerHeight: 60,
};
