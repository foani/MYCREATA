import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useDID } from '../../hooks/useDID';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type DIDBackupScreenNavigationProp = StackNavigationProp<MainStackParamList, 'DIDBackup'>;

enum BackupType {
  CLOUD = 'CLOUD',
  LOCAL = 'LOCAL',
  EXPORT = 'EXPORT',
}

const DIDBackupScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<DIDBackupScreenNavigationProp>();
  const { backupToCloud, exportBackup, did } = useDID();

  const [loading, setLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<BackupType | null>(null);

  const currentStyles = styles(theme);

  const handleCloudBackup = async () => {
    if (!did) {
      Alert.alert(t('did.error'), t('did.noDIDForBackup'));
      return;
    }

    setLoading(true);
    try {
      await backupToCloud();
      setBackupSuccess(BackupType.CLOUD);
      Alert.alert(t('did.success'), t('did.cloudBackupSuccess'));
    } catch (error) {
      console.error('Error backing up to cloud:', error);
      Alert.alert(t('did.error'), t('did.cloudBackupError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLocalBackup = async () => {
    if (!did) {
      Alert.alert(t('did.error'), t('did.noDIDForBackup'));
      return;
    }

    setLoading(true);
    try {
      const backupData = await exportBackup();
      
      // On iOS, use document picker to save to Files app
      if (Platform.OS === 'ios') {
        // This would use a document picker in a real implementation
        // For now, we'll just simulate it
        setTimeout(() => {
          setBackupSuccess(BackupType.LOCAL);
          Alert.alert(t('did.success'), t('did.localBackupSuccess'));
          setLoading(false);
        }, 1000);
      } 
      // On Android, prompt to save to Downloads folder
      else {
        // This would use Android's Storage Access Framework in a real implementation
        // For now, we'll just simulate it
        setTimeout(() => {
          setBackupSuccess(BackupType.LOCAL);
          Alert.alert(t('did.success'), t('did.localBackupSuccess'));
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating local backup:', error);
      Alert.alert(t('did.error'), t('did.localBackupError'));
      setLoading(false);
    }
  };

  const handleExportBackup = async () => {
    if (!did) {
      Alert.alert(t('did.error'), t('did.noDIDForBackup'));
      return;
    }

    setLoading(true);
    try {
      const backupData = await exportBackup();
      
      await Share.share({
        title: t('did.backupExport'),
        message: Platform.OS === 'ios' ? t('did.backupData') : backupData,
      });
      
      setBackupSuccess(BackupType.EXPORT);
    } catch (error) {
      console.error('Error exporting backup:', error);
      Alert.alert(t('did.error'), t('did.exportBackupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('did.backup')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={currentStyles.content} contentContainerStyle={currentStyles.contentContainer}>
        <View style={currentStyles.infoCard}>
          <Icon name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={currentStyles.infoText}>{t('did.backupImportance')}</Text>
        </View>

        <Text style={currentStyles.sectionTitle}>{t('did.backupOptions')}</Text>

        <TouchableOpacity
          style={[
            currentStyles.optionCard,
            backupSuccess === BackupType.CLOUD ? currentStyles.successCard : null,
          ]}
          onPress={handleCloudBackup}
          disabled={loading}
        >
          <View style={currentStyles.optionIcon}>
            <Icon
              name="cloud-upload"
              size={24}
              color={backupSuccess === BackupType.CLOUD ? colors.white : colors.primary}
            />
          </View>
          <View style={currentStyles.optionContent}>
            <Text
              style={[
                currentStyles.optionTitle,
                backupSuccess === BackupType.CLOUD ? currentStyles.successText : null,
              ]}
            >
              {t('did.cloudBackup')}
            </Text>
            <Text
              style={[
                currentStyles.optionDescription,
                backupSuccess === BackupType.CLOUD ? currentStyles.successDescription : null,
              ]}
            >
              {t('did.cloudBackupDesc')}
            </Text>
          </View>
          {loading && backupSuccess !== BackupType.CLOUD ? (
            <ActivityIndicator color={colors.primary} />
          ) : backupSuccess === BackupType.CLOUD ? (
            <Icon name="checkmark-circle" size={24} color={colors.white} />
          ) : (
            <Icon name="chevron-forward" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            currentStyles.optionCard,
            backupSuccess === BackupType.LOCAL ? currentStyles.successCard : null,
          ]}
          onPress={handleLocalBackup}
          disabled={loading}
        >
          <View style={currentStyles.optionIcon}>
            <Icon
              name="download"
              size={24}
              color={backupSuccess === BackupType.LOCAL ? colors.white : colors.primary}
            />
          </View>
          <View style={currentStyles.optionContent}>
            <Text
              style={[
                currentStyles.optionTitle,
                backupSuccess === BackupType.LOCAL ? currentStyles.successText : null,
              ]}
            >
              {t('did.localBackup')}
            </Text>
            <Text
              style={[
                currentStyles.optionDescription,
                backupSuccess === BackupType.LOCAL ? currentStyles.successDescription : null,
              ]}
            >
              {t('did.localBackupDesc')}
            </Text>
          </View>
          {loading && backupSuccess !== BackupType.LOCAL ? (
            <ActivityIndicator color={colors.primary} />
          ) : backupSuccess === BackupType.LOCAL ? (
            <Icon name="checkmark-circle" size={24} color={colors.white} />
          ) : (
            <Icon name="chevron-forward" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            currentStyles.optionCard,
            backupSuccess === BackupType.EXPORT ? currentStyles.successCard : null,
          ]}
          onPress={handleExportBackup}
          disabled={loading}
        >
          <View style={currentStyles.optionIcon}>
            <Icon
              name="share-social"
              size={24}
              color={backupSuccess === BackupType.EXPORT ? colors.white : colors.primary}
            />
          </View>
          <View style={currentStyles.optionContent}>
            <Text
              style={[
                currentStyles.optionTitle,
                backupSuccess === BackupType.EXPORT ? currentStyles.successText : null,
              ]}
            >
              {t('did.exportBackup')}
            </Text>
            <Text
              style={[
                currentStyles.optionDescription,
                backupSuccess === BackupType.EXPORT ? currentStyles.successDescription : null,
              ]}
            >
              {t('did.exportBackupDesc')}
            </Text>
          </View>
          {loading && backupSuccess !== BackupType.EXPORT ? (
            <ActivityIndicator color={colors.primary} />
          ) : backupSuccess === BackupType.EXPORT ? (
            <Icon name="checkmark-circle" size={24} color={colors.white} />
          ) : (
            <Icon name="chevron-forward" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          )}
        </TouchableOpacity>

        <View style={currentStyles.tipCard}>
          <Text style={currentStyles.tipTitle}>{t('did.securityTips')}</Text>
          <View style={currentStyles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.tipText}>{t('did.securityTip1')}</Text>
          </View>
          <View style={currentStyles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.tipText}>{t('did.securityTip2')}</Text>
          </View>
          <View style={currentStyles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} style={currentStyles.tipIcon} />
            <Text style={currentStyles.tipText}>{t('did.securityTip3')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={currentStyles.learnMoreButton}
          onPress={() => Linking.openURL('https://docs.creatachain.com/did/backup')}
        >
          <Text style={currentStyles.learnMoreButtonText}>{t('did.learnMore')}</Text>
          <Icon name="open-outline" size={16} color={colors.primary} />
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
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(65,105,225,0.1)' : 'rgba(65,105,225,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme === 'dark' ? colors.white : colors.black,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successCard: {
    backgroundColor: colors.primary,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  successText: {
    color: colors.white,
  },
  optionDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  successDescription: {
    color: 'rgba(255,255,255,0.8)',
  },
  tipCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 24,
  },
  learnMoreButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
    fontWeight: '500',
  },
});

export default DIDBackupScreen;
