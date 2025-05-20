import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/**
 * 기본 버튼 컴포넌트
 */
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  iconLeft,
  iconRight,
  disabled,
  buttonStyle,
  textStyle,
  fullWidth = false,
  ...rest
}) => {
  const { colors } = useTheme();

  // 버튼 배경색 결정
  const getBackgroundColor = () => {
    if (disabled) {
      return colors.textTertiary;
    }

    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  // 버튼 테두리 결정
  const getBorderColor = () => {
    if (disabled) {
      return colors.textTertiary;
    }

    switch (variant) {
      case 'outline':
        return colors.primary;
      default:
        return 'transparent';
    }
  };

  // 텍스트 색상 결정
  const getTextColor = () => {
    if (disabled) {
      return colors.background;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.background;
      case 'outline':
      case 'text':
        return colors.primary;
      default:
        return colors.background;
    }
  };

  // 버튼 사이즈에 따른 패딩 결정
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };

  // 버튼 사이즈에 따른 폰트 사이즈 결정
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  // 활성/비활성 상태에 따른 투명도 결정
  const getOpacity = () => {
    return disabled ? 0.6 : 1;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: getOpacity(),
          ...getPadding(),
          ...(fullWidth && { width: '100%' }),
        },
        variant === 'outline' && { borderWidth: 1 },
        buttonStyle,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {iconLeft}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: iconLeft ? 8 : 0,
                marginRight: iconRight ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
