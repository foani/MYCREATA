import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MMKV } from 'react-native-mmkv';
import { NativeModules, Platform } from 'react-native';

// 언어 리소스
import enTranslation from './translations/en.json';
import koTranslation from './translations/ko.json';
import jaTranslation from './translations/ja.json';
import viTranslation from './translations/vi.json';

// 스토리지 인스턴스
const storage = new MMKV();

// 기기 언어 가져오기
const getDeviceLanguage = (): string => {
  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 이하
      : NativeModules.I18nManager.localeIdentifier;

  return locale.substring(0, 2); // 언어 코드만 가져오기 (예: 'en', 'ko')
};

// 저장된 언어 또는 기기 언어 사용
const savedLang = storage.getString('language');
const deviceLang = getDeviceLanguage();
const defaultLang = savedLang || deviceLang || 'en';

// i18n 설정
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ko: { translation: koTranslation },
    ja: { translation: jaTranslation },
    vi: { translation: viTranslation },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

/**
 * 언어 변경 함수
 */
export const changeLanguage = (lang: string) => {
  storage.set('language', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
