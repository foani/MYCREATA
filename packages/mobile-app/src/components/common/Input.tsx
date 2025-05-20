import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconAction?: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  secure?: boolean;
}

/**
 * 기본 입력 컴포넌트
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  rightIconAction,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  helperStyle,
  secure = false,
  value,
  onChangeText,
  placeholder,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(secure);

  // 입력 필드 테두리 색상 결정
  const getBorderColor = () => {
    if (error) {
      return colors.error;
    }
    if (isFocused) {
      return colors.primary;
    }
    return colors.border;
  };

  // 보안 텍스트 토글 아이콘
  const renderSecureIcon = () => {
    if (!secure) return null;

    return (
      <TouchableOpacity
        onPress={() => setSecureTextEntry(!secureTextEntry)}
        style={styles.secureButton}
      >
        <Text style={{ color: colors.textSecondary }}>
          {secureTextEntry ? '보기' : '숨기기'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text },
            error && { color: colors.error },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              marginLeft: leftIcon ? 8 : 0,
              marginRight: rightIcon || secure ? 8 : 0,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          {...rest}
        />

        {renderSecureIcon()}

        {rightIcon && (
          <TouchableOpacity
            onPress={rightIconAction}
            style={styles.rightIconContainer}
            disabled={!rightIconAction}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={[styles.error, { color: colors.error }, errorStyle]}
        >
          {error}
        </Text>
      )}

      {helper && !error && (
        <Text
          style={[styles.helper, { color: colors.textSecondary }, helperStyle]}
        >
          {helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  secureButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
