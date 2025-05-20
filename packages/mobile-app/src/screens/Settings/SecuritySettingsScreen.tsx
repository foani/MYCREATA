import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../hooks/useWallet';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type SecuritySettingsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SecuritySettings'>;

const SecuritySettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<SecuritySettingsScreenNavigationProp>();
  const { pinEnabled, biometricsEnabled, togglePinEnabled, toggleBiometricsEnabled } = useAuth();
  const { autoLockSettings, updateAutoLockSettings } = useWallet();
  
  const [requirePinForTransactions, setRequirePinForTransactions] = useState(true);
  const [approvedDomains, setApprovedDomains] = useState<string[]>([]);
  const [autoLockTime, setAutoLockTime] = useState(autoLockSettings?.timeInMinutes || 5);

  const currentStyles = styles(theme);

  useEffect(() => {
    // Load approved domains from storage or API
    const loadApprovedDomains = async () => {
      // This would fetch from a real data source in a production app
      setApprovedDomains(['creatachain.com', 'crelink.io', 'creatascan.com']);
    };

    loadApprovedDomains();
  }, []);

  const handleTogglePinEnabled = () => {
    if (pinEnabled) {
      Alert.alert(
        t('settings.disablePINTitle'),
        t('settings.disablePINWarning'),
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
      // Navigate to set PIN screen
      navigation.navigate('SetPin', { isUpdate: false });
    }
  };

  const handleToggleBiometricsEnabled = () => {
    if (!pinEnabled && !biometricsEnabled) {
      Alert.alert(
        t('settings.enablePINFirst'),
        t('settings.enablePINFirstDesc'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    toggleBiometricsEnabled();
  };

  const handleToggleRequirePinForTransactions = () => {
    // In a real app, this would update some secure storage or API
    setRequirePinForTransactions(prev => !prev);
  };

  const handleSetAutoLockTime = () => {
    navigation.navigate('AutoLockSettings', {
      currentTime: autoLockTime,
      onSelect: (minutes: number) => {
        setAutoLockTime(minutes);
        updateAutoLockSettings({ timeInMinutes: minutes });
      }
    });
  };

  const handleManageApprovedDomains = () => {
    navigation.navigate('ApprovedDomains', { domains: approvedDomains });
  };

  const handleChangePIN = () => {
    navigation.navigate('SetPin', { isUpdate: true });
  };

  const handleAdvancedSecurity = () => {
    navigation.navigate('AdvancedSecurity');
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('settings.securitySettings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={currentStyles.content}>
        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.authentication')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem}>
            <View style={currentStyles.settingInfo}>
              <Icon name="keypad" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <View style={currentStyles.settingTextContainer}>
                <Text style={currentStyles.settingText}>{t('settings.pinProtection')}</Text>
                <Text style={currentStyles.settingDescription}>{t('settings.pinProtectionDesc')}</Text>
              </View>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handleTogglePinEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={colors.white}
            />
          </TouchableOpacity>
          
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={currentStyles.settingItem}>
              <View style={currentStyles.settingInfo}>
                <Icon 
                  name={Platform.OS === 'ios' ? 'finger-print' : 'fingerprint'} 
                  size={24} 
                  color={theme === 'dark' ? colors.white : colors.black} 
                />
                <View style={currentStyles.settingTextContainer}>
                  <Text style={currentStyles.settingText}>{t('settings.biometricAuth')}</Text>
                  <Text style={currentStyles.settingDescription}>{t('settings.biometricAuthDesc')}</Text>
                </View>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={handleToggleBiometricsEnabled}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={colors.white}
                disabled={!pinEnabled}
              />
            </TouchableOpacity>
          )}
          
          {pinEnabled && (
            <TouchableOpacity 
              style={currentStyles.settingItem}
              onPress={handleChangePIN}
            >
              <View style={currentStyles.settingInfo}>
                <Icon name="create" size={24} color={theme === 'dark' ? colors.white : colors.black} />
                <Text style={currentStyles.settingText}>{t('settings.changePin')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </TouchableOpacity>
          )}
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.transactionSecurity')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem}>
            <View style={currentStyles.settingInfo}>
              <Icon name="shield-checkmark" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <View style={currentStyles.settingTextContainer}>
                <Text style={currentStyles.settingText}>{t('settings.requirePinForTx')}</Text>
                <Text style={currentStyles.settingDescription}>{t('settings.requirePinForTxDesc')}</Text>
              </View>
            </View>
            <Switch
              value={requirePinForTransactions}
              onValueChange={handleToggleRequirePinForTransactions}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={colors.white}
              disabled={!pinEnabled}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={currentStyles.settingItem}
            onPress={handleManageApprovedDomains}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="globe" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <View style={currentStyles.settingTextContainer}>
                <Text style={currentStyles.settingText}>{t('settings.approvedDomains')}</Text>
                <Text style={currentStyles.settingDescription}>
                  {approvedDomains.length > 0 
                    ? t('settings.approvedDomainsCount', { count: approvedDomains.length }) 
                    : t('settings.noApprovedDomains')}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.appSecurity')}</Text>
          
          <TouchableOpacity 
            style={currentStyles.settingItem}
            onPress={handleSetAutoLockTime}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="timer" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.autoLock')}</Text>
            </View>
            <View style={currentStyles.valueContainer}>
              <Text style={currentStyles.valueText}>
                {autoLockTime === 0 
                  ? t('settings.never') 
                  : autoLockTime === 1 
                    ? t('settings.afterOneMinute') 
                    : t('settings.afterMinutes', { minutes: autoLockTime })}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={currentStyles.settingItem}
            onPress={handleAdvancedSecurity}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="lock-closed" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.advancedSecurity')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.securityTipsContainer}>
          <View style={currentStyles.securityTipHeader}>
            <Icon name="alert-circle" size={24} color={colors.warning} />
            <Text style={currentStyles.securityTipTitle}>{t('settings.securityTips')}</Text>
          </View>
          <View style={currentStyles.securityTip}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.securityTipText}>{t('settings.securityTip1')}</Text>
          </View>
          <View style={currentStyles.securityTip}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.securityTipText}>{t('settings.securityTip2')}</Text>
          </View>
          <View style={currentStyles.securityTip}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.securityTipText}>{t('settings.securityTip3')}</Text>
          </View>
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginRight: 4,
  },
  securityTipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,204,0,0.1)' : 'rgba(255,204,0,0.05)',
    borderRadius: 12,
    marginBottom: 32,
  },
  securityTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityTipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginLeft: 8,
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  securityTipText: {
    flex: 1,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
});

export default SecuritySettingsScreen;
