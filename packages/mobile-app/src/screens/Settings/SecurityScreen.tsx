import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainScreenNavigationProp } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBiometrics } from '../../hooks/useBiometrics';

/**
 * 보안 설정 화면
 * PIN, 생체인증 등 보안 관련 설정을 관리하는 화면
 */
const SecurityScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<MainScreenNavigationProp<'Security'>>();
  const { 
    pinEnabled, 
    biometricsEnabled, 
    biometricsSupported,
    togglePinEnabled 
  } = useAuth();
  const { typeName, iconName } = useBiometrics();

  const currentStyles = styles(theme);

  /**
   * PIN 활성화 토글 처리
   */
  const handleTogglePin = () => {
    if (pinEnabled) {
      Alert.alert(
        t('security.disablePin'),
        t('security.disablePinMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.disable'),
            style: 'destructive',
            onPress: togglePinEnabled
          }
        ]
      );
    } else {
      navigation.navigate('SetPin');
    }
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity
          style={currentStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon 
            name="arrow-back" 
            size={24} 
            color={theme === 'dark' ? colors.white : colors.black} 
          />
        </TouchableOpacity>
        <Text style={currentStyles.headerTitle}>{t('settings.security')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={currentStyles.scrollContent}>
        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('security.authentication')}</Text>

          <View style={currentStyles.settingItem}>
            <View style={currentStyles.settingInfo}>
              <Icon name="keypad-outline" size={24} color={colors.primary} style={currentStyles.settingIcon} />
              <View>
                <Text style={currentStyles.settingTitle}>{t('security.pinProtection')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.pinDescription')}</Text>
              </View>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handleTogglePin}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={pinEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[
              currentStyles.settingItem,
              !pinEnabled && currentStyles.disabledSetting
            ]}
            onPress={() => {
              if (pinEnabled) {
                navigation.navigate('SetPin');
              } else {
                Alert.alert(
                  t('security.pinRequired'),
                  t('security.enablePinFirst')
                );
              }
            }}
            disabled={!pinEnabled}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="create-outline" size={24} color={pinEnabled ? colors.primary : colors.gray} style={currentStyles.settingIcon} />
              <View>
                <Text style={[currentStyles.settingTitle, !pinEnabled && currentStyles.disabledText]}>{t('security.changePin')}</Text>
                <Text style={[currentStyles.settingDescription, !pinEnabled && currentStyles.disabledText]}>{t('security.changePinDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={pinEnabled ? colors.darkGray : colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              currentStyles.settingItem,
              (!pinEnabled || !biometricsSupported) && currentStyles.disabledSetting
            ]}
            onPress={() => {
              if (pinEnabled && biometricsSupported) {
                navigation.navigate('BiometricSetup');
              } else if (!pinEnabled) {
                Alert.alert(
                  t('security.pinRequired'),
                  t('security.enablePinFirst')
                );
              } else {
                Alert.alert(
                  t('security.biometricUnsupported'),
                  t('security.deviceNotSupported')
                );
              }
            }}
            disabled={!pinEnabled || !biometricsSupported}
          >
            <View style={currentStyles.settingInfo}>
              <Icon 
                name={iconName} 
                size={24} 
                color={(pinEnabled && biometricsSupported) ? colors.primary : colors.gray} 
                style={currentStyles.settingIcon} 
              />
              <View>
                <Text style={[
                  currentStyles.settingTitle, 
                  (!pinEnabled || !biometricsSupported) && currentStyles.disabledText
                ]}>{t('security.biometric', { type: typeName })}</Text>
                <Text style={[
                  currentStyles.settingDescription, 
                  (!pinEnabled || !biometricsSupported) && currentStyles.disabledText
                ]}>{
                  biometricsEnabled 
                    ? t('security.biometricEnabled', { type: typeName })
                    : t('security.biometricDescription', { type: typeName })
                }</Text>
              </View>
            </View>
            <Icon 
              name="chevron-forward" 
              size={20}
              color={(pinEnabled && biometricsSupported) ? colors.darkGray : colors.gray} 
            />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('security.backup')}</Text>

          <TouchableOpacity
            style={currentStyles.settingItem}
            onPress={() => {
              // TODO: 니모닉 백업 기능 구현
              Alert.alert(
                t('security.backupWallet'),
                t('security.backupWalletDescription'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.proceed') }
                ]
              );
            }}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="document-text-outline" size={24} color={colors.primary} style={currentStyles.settingIcon} />
              <View>
                <Text style={currentStyles.settingTitle}>{t('security.backupWallet')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.backupWalletDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={currentStyles.settingItem}
            onPress={() => {
              // TODO: 클라우드 백업 기능 구현
              Alert.alert(
                t('security.cloudBackup'),
                t('security.cloudBackupDescription'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.proceed') }
                ]
              );
            }}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="cloud-upload-outline" size={24} color={colors.primary} style={currentStyles.settingIcon} />
              <View>
                <Text style={currentStyles.settingTitle}>{t('security.cloudBackup')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.cloudBackupDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.darkGray} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('security.advanced')}</Text>

          <TouchableOpacity
            style={currentStyles.settingItem}
            onPress={() => {
              // TODO: 개인키 내보내기 기능 구현
              Alert.alert(
                t('security.exportPrivateKey'),
                t('security.exportPrivateKeyWarning'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('common.proceed'),
                    style: 'destructive',
                  }
                ]
              );
            }}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="key-outline" size={24} color={colors.warning} style={currentStyles.settingIcon} />
              <View>
                <Text style={currentStyles.settingTitle}>{t('security.exportPrivateKey')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.exportPrivateKeyDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={currentStyles.settingItem}
            onPress={() => {
              // TODO: 자동 잠금 설정
              Alert.alert(
                t('security.autoLock'),
                t('security.selectAutoLockTime'),
                [
                  { text: '1 minute' },
                  { text: '5 minutes' },
                  { text: '15 minutes' },
                  { text: '1 hour' },
                  { text: t('common.cancel'), style: 'cancel' },
                ]
              );
            }}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="time-outline" size={24} color={colors.primary} style={currentStyles.settingIcon} />
              <View>
                <Text style={currentStyles.settingTitle}>{t('security.autoLock')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.autoLockDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[currentStyles.settingItem, currentStyles.dangerItem]}
            onPress={() => {
              Alert.alert(
                t('security.resetWallet'),
                t('security.resetWalletWarning'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('security.resetWalletConfirm'), 
                    style: 'destructive',
                    onPress: () => {
                      // TODO: 지갑 초기화 기능 구현
                    }
                  }
                ]
              );
            }}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="trash-outline" size={24} color={colors.error} style={currentStyles.settingIcon} />
              <View>
                <Text style={[currentStyles.settingTitle, currentStyles.dangerText]}>{t('security.resetWallet')}</Text>
                <Text style={currentStyles.settingDescription}>{t('security.resetWalletDescription')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.darkGray} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? colors.lightGray : colors.darkGray,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  disabledSetting: {
    opacity: 0.7,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.darkGray,
  },
  disabledText: {
    color: colors.gray,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.error,
  },
});

export default SecurityScreen;
