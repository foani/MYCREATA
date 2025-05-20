import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Linking,
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
import { version } from '../../../package.json';

type SettingsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout } = useAuth();
  const { activeNetwork } = useWallet();

  const currentStyles = styles(theme);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logoutTitle'),
      t('settings.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    navigation.navigate('LanguageSettings');
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings');
  };

  const handleNetworkSettings = () => {
    navigation.navigate('NetworkSettings');
  };

  const handleAdvancedSettings = () => {
    navigation.navigate('AdvancedSettings');
  };

  const handleAbout = () => {
    navigation.navigate('About');
  };

  const handleSupport = () => {
    Linking.openURL('https://support.crelink.io');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://crelink.io/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://crelink.io/terms');
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <Text style={currentStyles.title}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={currentStyles.content}>
        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.appearance')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem}>
            <View style={currentStyles.settingInfo}>
              <Icon name="moon" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.darkMode')}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={colors.white}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleLanguageChange}>
            <View style={currentStyles.settingInfo}>
              <Icon name="language" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.language')}</Text>
            </View>
            <View style={currentStyles.valueContainer}>
              <Text style={currentStyles.valueText}>
                {i18n.language === 'ko' ? '한국어' : 
                 i18n.language === 'ja' ? '日本語' : 
                 i18n.language === 'vi' ? 'Tiếng Việt' : 
                 'English'}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.security')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleSecuritySettings}>
            <View style={currentStyles.settingInfo}>
              <Icon name="shield" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.securitySettings')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={currentStyles.settingItem}
            onPress={() => navigation.navigate('BackupRecovery')}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="cloud-upload" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.backupRecovery')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.network')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleNetworkSettings}>
            <View style={currentStyles.settingInfo}>
              <Icon name="globe" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.networkSettings')}</Text>
            </View>
            <View style={currentStyles.valueContainer}>
              <Text style={currentStyles.valueText}>
                {activeNetwork?.name || 'Catena Mainnet'}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={currentStyles.settingItem}
            onPress={handleAdvancedSettings}
          >
            <View style={currentStyles.settingInfo}>
              <Icon name="construct" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.advanced')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.section}>
          <Text style={currentStyles.sectionTitle}>{t('settings.about')}</Text>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleAbout}>
            <View style={currentStyles.settingInfo}>
              <Icon name="information-circle" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.aboutCreLink')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleSupport}>
            <View style={currentStyles.settingInfo}>
              <Icon name="help-circle" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.support')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handlePrivacyPolicy}>
            <View style={currentStyles.settingInfo}>
              <Icon name="document-text" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.privacyPolicy')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={currentStyles.settingItem} onPress={handleTermsOfService}>
            <View style={currentStyles.settingInfo}>
              <Icon name="document" size={24} color={theme === 'dark' ? colors.white : colors.black} />
              <Text style={currentStyles.settingText}>{t('settings.termsOfService')}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
          
          <View style={currentStyles.versionContainer}>
            <Text style={currentStyles.versionText}>
              {t('settings.version')}: {version}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={currentStyles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={colors.error} />
          <Text style={currentStyles.logoutButtonText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
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
  },
  settingText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
    marginLeft: 12,
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
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginLeft: 8,
  },
});

export default SettingsScreen;
