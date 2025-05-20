import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useDID } from '../../hooks/useDID';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type CreateDIDScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateDID'>;

enum DIDType {
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  ZKDID = 'ZKDID',
}

const CreateDIDScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<CreateDIDScreenNavigationProp>();
  const { createDID } = useDID();

  const [step, setStep] = useState(1);
  const [didType, setDIDType] = useState<DIDType | null>(null);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const currentStyles = styles(theme);

  const validateStep1 = () => {
    if (!didType) {
      Alert.alert(t('did.error'), t('did.selectType'));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!name.trim()) {
      Alert.alert(t('did.error'), t('did.enterName'));
      return false;
    }
    
    if (!identifier.trim()) {
      Alert.alert(t('did.error'), t('did.enterIdentifier'));
      return false;
    }

    // Additional identifier validation based on type
    if (didType === DIDType.EMAIL && !identifier.includes('@')) {
      Alert.alert(t('did.error'), t('did.invalidEmail'));
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleCreateDID();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreateDID = async () => {
    if (!didType || !name || !identifier) {
      return;
    }

    setLoading(true);
    try {
      await createDID({
        type: didType,
        name,
        identifier,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating DID:', error);
      Alert.alert(t('did.error'), t('did.createError'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={currentStyles.stepTitle}>{t('did.selectIdentityType')}</Text>
      <Text style={currentStyles.stepDescription}>{t('did.selectIdentityDesc')}</Text>

      <TouchableOpacity
        style={[
          currentStyles.optionCard,
          didType === DIDType.EMAIL ? currentStyles.selectedOption : null,
        ]}
        onPress={() => setDIDType(DIDType.EMAIL)}
      >
        <View style={currentStyles.optionIconContainer}>
          <Icon
            name="mail"
            size={24}
            color={didType === DIDType.EMAIL ? colors.white : colors.primary}
          />
        </View>
        <View style={currentStyles.optionContent}>
          <Text
            style={[
              currentStyles.optionTitle,
              didType === DIDType.EMAIL ? currentStyles.selectedOptionTitle : null,
            ]}
          >
            {t('did.emailDID')}
          </Text>
          <Text
            style={[
              currentStyles.optionDescription,
              didType === DIDType.EMAIL ? currentStyles.selectedOptionDescription : null,
            ]}
          >
            {t('did.emailDIDDesc')}
          </Text>
        </View>
        {didType === DIDType.EMAIL && (
          <Icon name="checkmark-circle" size={24} color={colors.white} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          currentStyles.optionCard,
          didType === DIDType.TELEGRAM ? currentStyles.selectedOption : null,
        ]}
        onPress={() => setDIDType(DIDType.TELEGRAM)}
      >
        <View style={currentStyles.optionIconContainer}>
          <Icon
            name="paper-plane"
            size={24}
            color={didType === DIDType.TELEGRAM ? colors.white : colors.primary}
          />
        </View>
        <View style={currentStyles.optionContent}>
          <Text
            style={[
              currentStyles.optionTitle,
              didType === DIDType.TELEGRAM ? currentStyles.selectedOptionTitle : null,
            ]}
          >
            {t('did.telegramDID')}
          </Text>
          <Text
            style={[
              currentStyles.optionDescription,
              didType === DIDType.TELEGRAM ? currentStyles.selectedOptionDescription : null,
            ]}
          >
            {t('did.telegramDIDDesc')}
          </Text>
        </View>
        {didType === DIDType.TELEGRAM && (
          <Icon name="checkmark-circle" size={24} color={colors.white} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          currentStyles.optionCard,
          didType === DIDType.ZKDID ? currentStyles.selectedOption : null,
        ]}
        onPress={() => setDIDType(DIDType.ZKDID)}
      >
        <View style={currentStyles.optionIconContainer}>
          <Icon
            name="shield"
            size={24}
            color={didType === DIDType.ZKDID ? colors.white : colors.primary}
          />
        </View>
        <View style={currentStyles.optionContent}>
          <Text
            style={[
              currentStyles.optionTitle,
              didType === DIDType.ZKDID ? currentStyles.selectedOptionTitle : null,
            ]}
          >
            {t('did.zkDID')}
          </Text>
          <Text
            style={[
              currentStyles.optionDescription,
              didType === DIDType.ZKDID ? currentStyles.selectedOptionDescription : null,
            ]}
          >
            {t('did.zkDIDDesc')}
          </Text>
        </View>
        {didType === DIDType.ZKDID && (
          <Icon name="checkmark-circle" size={24} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={currentStyles.stepTitle}>{t('did.enterIdentityDetails')}</Text>
      <Text style={currentStyles.stepDescription}>{t('did.enterIdentityDetailsDesc')}</Text>

      <View style={currentStyles.inputGroup}>
        <Text style={currentStyles.inputLabel}>{t('did.name')}</Text>
        <TextInput
          style={currentStyles.input}
          placeholder={t('did.namePlaceholder')}
          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
      </View>

      <View style={currentStyles.inputGroup}>
        <Text style={currentStyles.inputLabel}>
          {didType === DIDType.EMAIL
            ? t('did.email')
            : didType === DIDType.TELEGRAM
            ? t('did.telegramUsername')
            : t('did.identifier')}
        </Text>
        <TextInput
          style={currentStyles.input}
          placeholder={
            didType === DIDType.EMAIL
              ? t('did.emailPlaceholder')
              : didType === DIDType.TELEGRAM
              ? t('did.telegramPlaceholder')
              : t('did.identifierPlaceholder')
          }
          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType={didType === DIDType.EMAIL ? 'email-address' : 'default'}
        />
      </View>

      <View style={currentStyles.infoCard}>
        <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.lightGray : colors.gray} />
        <Text style={currentStyles.infoText}>
          {didType === DIDType.EMAIL
            ? t('did.emailVerificationNote')
            : didType === DIDType.TELEGRAM
            ? t('did.telegramVerificationNote')
            : t('did.zkDIDNote')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={handlePreviousStep}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('did.createDID')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={currentStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={currentStyles.content} contentContainerStyle={currentStyles.contentContainer}>
          <View style={currentStyles.stepsIndicator}>
            <View
              style={[
                currentStyles.stepIndicator,
                step >= 1 ? currentStyles.activeStepIndicator : null,
              ]}
            >
              <Text
                style={[
                  currentStyles.stepIndicatorText,
                  step >= 1 ? currentStyles.activeStepIndicatorText : null,
                ]}
              >
                1
              </Text>
            </View>
            <View style={currentStyles.stepLine} />
            <View
              style={[
                currentStyles.stepIndicator,
                step >= 2 ? currentStyles.activeStepIndicator : null,
              ]}
            >
              <Text
                style={[
                  currentStyles.stepIndicatorText,
                  step >= 2 ? currentStyles.activeStepIndicatorText : null,
                ]}
              >
                2
              </Text>
            </View>
          </View>

          {step === 1 ? renderStep1() : renderStep2()}
        </ScrollView>

        <View style={currentStyles.footer}>
          <TouchableOpacity style={currentStyles.backBtn} onPress={handlePreviousStep}>
            <Text style={currentStyles.backBtnText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[currentStyles.nextBtn, loading ? currentStyles.disabledBtn : null]}
            onPress={handleNextStep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={currentStyles.nextBtnText}>
                {step === 2 ? t('did.create') : t('common.next')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepIndicator: {
    backgroundColor: colors.primary,
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  activeStepIndicatorText: {
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 4,
  },
  selectedOptionTitle: {
    color: colors.white,
  },
  optionDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  selectedOptionDescription: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
  },
  backBtnText: {
    color: theme === 'dark' ? colors.white : colors.black,
    fontWeight: '500',
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  nextBtnText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default CreateDIDScreen;
