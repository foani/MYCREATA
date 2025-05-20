import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 스플래시 화면 - 앱 시작 시 표시
 */
const SplashScreen: React.FC = () => {
  const { isDarkMode, colors } = useTheme();
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.8);

  useEffect(() => {
    // 로고 애니메이션
    Animated.sequence([
      // 페이드 인
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // 잠시 대기
      Animated.delay(300),
      // 스케일 업
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* 로고 이미지 - 실제 앱에서는 적절한 로고 이미지로 교체 필요 */}
        <Image
          source={
            isDarkMode
              ? require('../assets/images/logo-dark.png')
              : require('../assets/images/logo-light.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});

export default SplashScreen;
