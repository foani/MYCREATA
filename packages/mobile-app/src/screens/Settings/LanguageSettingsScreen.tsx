import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type LanguageSettingsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'LanguageSettings'>;

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
  },
];

const LanguageSettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<LanguageSettingsScreenNavigationProp>();

  const currentStyles = styles(theme);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('settings.language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={currentStyles.content}>
        <View style={currentStyles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={currentStyles.languageItem}
              onPress={() => changeLanguage(language.code)}
            >
              <View style={currentStyles.languageInfo}>
                <Text style={currentStyles.languageName}>{language.nativeName}</Text>
                <Text style={currentStyles.languageNameTranslated}>{language.name}</Text>
              </View>
              {i18n.language === language.code && (
                <Icon name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={currentStyles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          <Text style={currentStyles.infoText}>
            {t('settings.languageChangeInfo')}
          </Text>
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
  languageList: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  languageNameTranslated: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    margin: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
});

export default LanguageSettingsScreen;
