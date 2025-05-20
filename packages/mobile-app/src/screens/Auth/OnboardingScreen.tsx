import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

// 온보딩 슬라이드 아이템 타입
type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: any; // 이미지 소스
};

// 화면 너비
const { width } = Dimensions.get('window');

/**
 * 온보딩 스크린 - 앱 최초 실행 시 표시
 */
const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  
  // 플랫리스트 참조 및 현재 슬라이드 인덱스
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 온보딩 슬라이드 데이터
  const onboardingData: OnboardingItem[] = [
    {
      id: '1',
      title: t('auth.onboarding.slide1.title', 'Welcome to CreLink Wallet'),
      description: t('auth.onboarding.slide1.description', 'Your gateway to the decentralized world of Catena blockchain and beyond'),
      image: require('../../assets/images/onboarding/slide1.png'),
    },
    {
      id: '2',
      title: t('auth.onboarding.slide2.title', 'Secure Your Digital Assets'),
      description: t('auth.onboarding.slide2.description', 'Manage your cryptocurrencies, tokens, and NFTs with advanced security features'),
      image: require('../../assets/images/onboarding/slide2.png'),
    },
    {
      id: '3',
      title: t('auth.onboarding.slide3.title', 'Decentralized Identity'),
      description: t('auth.onboarding.slide3.description', 'Use zkDID technology to prove your identity while preserving your privacy'),
      image: require('../../assets/images/onboarding/slide3.png'),
    },
  ];

  // 다음 슬라이드로 이동
  const goToNextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 슬라이드 아이템 렌더링
  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  // 페이지 인디케이터 렌더링
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === currentIndex ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // 마지막 슬라이드면 시작 버튼, 아니면 다음 버튼 표시
  const renderButton = () => {
    if (currentIndex === onboardingData.length - 1) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateWallet')}
          >
            <Text style={styles.getStartedButtonText}>{t('auth.onboarding.getStarted', 'Get Started')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={goToNextSlide}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 건너뛰기 버튼
  const renderSkipButton = () => {
    if (currentIndex === onboardingData.length - 1) return null;

    return (
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => {
          flatListRef.current?.scrollToIndex({ index: onboardingData.length - 1 });
          setCurrentIndex(onboardingData.length - 1);
        }}
      >
        <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
          {t('auth.onboarding.skip', 'Skip')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
          );
          setCurrentIndex(index);
        }}
      />
      {renderPagination()}
      {renderButton()}
      {renderSkipButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  nextButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  getStartedButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
