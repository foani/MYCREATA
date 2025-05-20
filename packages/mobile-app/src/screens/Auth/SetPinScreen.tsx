import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type SetPinScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SetPin'>;
type SetPinScreenRouteProp = RouteProp<AuthStackParamList, 'SetPin'>;

// PIN 입력 길이
const PIN_LENGTH = 6;

enum SetPinStep {
  CREATE = 'create',
  CONFIRM = 'confirm',
  OLD = 'old',
}

const SetPinScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<SetPinScreenNavigationProp>();
  const route = useRoute<SetPinScreenRouteProp>();
  const { createPin, updatePin } = useAuth();
  
  const isUpdate = route.params?.isUpdate || false;
  
  const [step, setStep] = useState<SetPinStep>(isUpdate ? SetPinStep.OLD : SetPinStep.CREATE);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 숨겨진 입력 필드에 대한 참조
  const pinInputRef = useRef<TextInput>(null);
  
  const currentStyles = styles(theme);

  // 화면이 처음 로드될 때 PIN 입력 필드에 포커스
  useEffect(() => {
    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 100);
  }, [step]);

  // PIN 입력 처리
  const handlePinChange = (value: string) => {
    // 숫자만 입력 가능하도록 필터링
    const filteredValue = value.replace(/[^0-9]/g, '');
    
    // 최대 길이 제한
    if (filteredValue.length <= PIN_LENGTH) {
      setPin(filteredValue);
      setError(null);
      
      // PIN이 완성되면 다음 단계로 진행
      if (filteredValue.length === PIN_LENGTH) {
        handlePinComplete(filteredValue);
      }
    }
  };

  // PIN 입력 완료 처리
  const handlePinComplete = async (pinValue: string) => {
    Keyboard.dismiss();
    
    // 현재 단계에 따라 다른 처리
    switch (step) {
      case SetPinStep.CREATE:
        // 새로운 PIN 설정
        setNewPin(pinValue);
        setPin('');
        setStep(SetPinStep.CONFIRM);
        setTimeout(() => pinInputRef.current?.focus(), 100);
        break;
        
      case SetPinStep.CONFIRM:
        // PIN 확인
        if (pinValue !== newPin) {
          setError(t('auth.pinMismatch'));
          setPin('');
          setTimeout(() => pinInputRef.current?.focus(), 100);
        } else {
          // PIN 일치, 저장 처리
          await savePin(pinValue);
        }
        break;
        
      case SetPinStep.OLD:
        // 이전 PIN 확인 후 새 PIN 입력으로 진행
        setPin('');
        setNewPin(pinValue);
        setStep(SetPinStep.CREATE);
        setTimeout(() => pinInputRef.current?.focus(), 100);
        break;
    }
  };

  // PIN 저장
  const savePin = async (pinValue: string) => {
    setLoading(true);
    
    try {
      let success = false;
      
      if (isUpdate) {
        // PIN 업데이트
        success = await updatePin(newPin, pinValue);
      } else {
        // 새 PIN 생성
        success = await createPin(pinValue);
      }
      
      if (success) {
        Alert.alert(
          isUpdate ? t('auth.pinUpdated') : t('auth.pinCreated'),
          isUpdate ? t('auth.pinUpdatedMessage') : t('auth.pinCreatedMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                if (isUpdate) {
                  navigation.goBack();
                } else {
                  // 온보딩 또는 생체인증 설정으로 이동
                  navigation.navigate('BiometricSetup');
                }
              },
            },
          ]
        );
      } else {
        setError(isUpdate ? t('auth.updatePinError') : t('auth.createPinError'));
        setPin('');
        setNewPin('');
        setStep(isUpdate ? SetPinStep.OLD : SetPinStep.CREATE);
      }
    } catch (error) {
      console.error('PIN save error:', error);
      setError(t('auth.pinSaveError'));
    } finally {
      setLoading(false);
    }
  };

  // 숫자 패드 항목 렌더링
  const renderNumberPadItem = (number: number | string) => {
    // 오른쪽 하단은 삭제 버튼
    if (number === 'delete') {
      return (
        <TouchableOpacity
          style={currentStyles.numberPadItem}
          onPress={() => setPin(prev => prev.slice(0, -1))}
          disabled={pin.length === 0}
        >
          <Icon
            name="backspace-outline"
            size={28}
            color={
              pin.length === 0
                ? theme === 'dark'
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(0,0,0,0.3)'
                : theme === 'dark'
                ? colors.white
                : colors.black
            }
          />
        </TouchableOpacity>
      );
    }
    
    // 왼쪽 하단은 빈 공간
    if (number === 'empty') {
      return <View style={currentStyles.numberPadItem} />;
    }
    
    return (
      <TouchableOpacity
        style={currentStyles.numberPadItem}
        onPress={() => handlePinChange(pin + number)}
      >
        <Text style={currentStyles.numberPadText}>{number}</Text>
      </TouchableOpacity>
    );
  };

  // PIN 코드 표시 함수
  const renderPinCode = () => {
    const dots = [];
    
    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            currentStyles.pinDot,
            pin.length > i ? currentStyles.pinDotFilled : null,
            error && pin.length === 0 ? currentStyles.pinDotError : null,
          ]}
        />
      );
    }
    
    return <View style={currentStyles.pinContainer}>{dots}</View>;
  };

  // 현재 단계에 맞는 타이틀 및 설명
  const getStepTitle = () => {
    switch (step) {
      case SetPinStep.CREATE:
        return isUpdate ? t('auth.enterNewPin') : t('auth.createPin');
      case SetPinStep.CONFIRM:
        return t('auth.confirmPin');
      case SetPinStep.OLD:
        return t('auth.enterCurrentPin');
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case SetPinStep.CREATE:
        return t('auth.createPinDescription');
      case SetPinStep.CONFIRM:
        return t('auth.confirmPinDescription');
      case SetPinStep.OLD:
        return t('auth.enterCurrentPinDescription');
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>
      
      <View style={currentStyles.titleContainer}>
        <Text style={currentStyles.title}>{getStepTitle()}</Text>
        <Text style={currentStyles.subtitle}>{getStepDescription()}</Text>
      </View>
      
      {error && (
        <View style={currentStyles.errorContainer}>
          <Icon name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={currentStyles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* 숨겨진 PIN 입력 필드 */}
      <TextInput
        ref={pinInputRef}
        style={{ position: 'absolute', opacity: 0 }}
        value={pin}
        onChangeText={handlePinChange}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        autoFocus
      />
      
      {/* PIN 코드 표시 */}
      {renderPinCode()}
      
      {/* 로딩 인디케이터 */}
      {loading && (
        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {/* 숫자 패드 */}
      <View style={currentStyles.numberPadContainer}>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(1)}
          {renderNumberPadItem(2)}
          {renderNumberPadItem(3)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(4)}
          {renderNumberPadItem(5)}
          {renderNumberPadItem(6)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(7)}
          {renderNumberPadItem(8)}
          {renderNumberPadItem(9)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem('empty')}
          {renderNumberPadItem(0)}
          {renderNumberPadItem('delete')}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
    padding: 12,
    marginHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.lightGray : colors.gray,
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinDotError: {
    borderColor: colors.error,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  numberPadContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 'auto',
  },
  numberPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numberPadItem: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
  },
  numberPadText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme === 'dark' ? colors.white : colors.black,
  },
});

export default SetPinScreen;
