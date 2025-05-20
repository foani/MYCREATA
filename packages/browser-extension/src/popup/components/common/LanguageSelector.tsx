/**
 * LanguageSelector.tsx
 * 언어 선택 컴포넌트
 */

import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  className?: string;
  onChange?: (language: string) => void;
}

/**
 * 언어 선택 컴포넌트
 * @param className 추가 스타일 클래스
 * @param onChange 언어 변경 콜백
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  onChange,
}) => {
  const { t } = useTranslation();
  const { language, changeLanguage, availableLanguages } = useI18n();
  
  /**
   * 언어 변경 핸들러
   * @param e 이벤트 객체
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    changeLanguage(newLanguage);
    
    if (onChange) {
      onChange(newLanguage);
    }
  };
  
  return (
    <div className={`${className}`}>
      <select
        className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
        value={language}
        onChange={handleChange}
        aria-label={t('settings.language')}
      >
        {Object.entries(availableLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;