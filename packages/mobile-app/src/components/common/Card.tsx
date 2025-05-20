import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  borderRadius?: number;
  noPadding?: boolean;
}

/**
 * 기본 카드 컴포넌트
 */
const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 1,
  borderRadius = 12,
  noPadding = false,
}) => {
  const { colors } = useTheme();

  // 그림자 스타일 생성
  const getShadowStyle = () => {
    if (elevation === 0) return {};

    return {
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
      elevation: elevation,
    };
  };

  // 카드 공통 스타일
  const cardStyle = [
    styles.container,
    getShadowStyle(),
    {
      backgroundColor: colors.card,
      borderRadius: borderRadius,
      borderColor: colors.border,
      padding: noPadding ? 0 : 16,
    },
    style,
  ];

  // 클릭 이벤트가 있는 경우 TouchableOpacity로 감싸기
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
});

export default Card;
