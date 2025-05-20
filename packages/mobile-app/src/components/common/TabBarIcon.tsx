import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 아이콘 타입
type IconName = 'home' | 'wallet' | 'activity' | 'user' | 'settings';

interface TabBarIconProps {
  name: IconName;
  color: string;
  size: number;
}

/**
 * 탭바 아이콘 컴포넌트
 */
const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
  // 아이콘 경로 정의
  const getIconPath = (): string => {
    switch (name) {
      case 'home':
        return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
      case 'wallet':
        return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
      case 'activity':
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      case 'user':
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case 'settings':
        return 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4';
      default:
        return '';
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={getIconPath()} />
      </Svg>
    </View>
  );
};

export default TabBarIcon;
