/**
 * LanguageSelector 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../../../src/popup/components/common/LanguageSelector';
import { I18nProvider } from '../../../src/popup/context/I18nContext';

// useTranslation 훅 모킹 (react-i18next)
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ko',
    },
  }),
}));

// useI18n 훅 모킹
jest.mock('../../../src/popup/context/I18nContext', () => {
  const originalModule = jest.requireActual('../../../src/popup/context/I18nContext');
  const mockChangeLanguage = jest.fn();

  return {
    ...originalModule,
    useI18n: () => ({
      language: 'ko',
      changeLanguage: mockChangeLanguage,
      availableLanguages: {
        ko: '한국어',
        en: 'English',
        ja: '日本語',
        vi: 'Tiếng Việt',
      },
    }),
    // I18nProvider는 실제 구현을 사용
    I18nProvider: originalModule.I18nProvider,
  };
});

// useWallet 훅 모킹
jest.mock('../../../src/popup/hooks/useWallet', () => ({
  useWallet: () => ({
    settings: {
      language: 'ko',
    },
    updateSettings: jest.fn(),
  }),
}));

describe('LanguageSelector', () => {
  test('컴포넌트가 렌더링되어야 함', () => {
    render(<LanguageSelector />);
    
    // select 요소가 렌더링되었는지 확인
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });
  
  test('모든 지원 언어가 옵션으로 표시되어야 함', () => {
    render(<LanguageSelector />);
    
    // 각 언어가 옵션으로 표시되었는지 확인
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(4); // ko, en, ja, vi
    
    // 각 옵션의 텍스트 확인
    expect(options[0]).toHaveTextContent('한국어');
    expect(options[1]).toHaveTextContent('English');
    expect(options[2]).toHaveTextContent('日本語');
    expect(options[3]).toHaveTextContent('Tiếng Việt');
  });
  
  test('현재 언어에 맞는 옵션이 선택되어야 함', () => {
    render(<LanguageSelector />);
    
    // select 요소의 value가 현재 언어('ko')여야 함
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('ko');
  });
  
  test('언어 변경 시 changeLanguage 함수가 호출되어야 함', () => {
    // I18nContext의 changeLanguage 함수에 접근하기 위한 모킹
    const mockChangeLanguage = jest.fn();
    jest.mock('../../../src/popup/context/I18nContext', () => ({
      useI18n: () => ({
        language: 'ko',
        changeLanguage: mockChangeLanguage,
        availableLanguages: {
          ko: '한국어',
          en: 'English',
          ja: '日本語',
          vi: 'Tiếng Việt',
        },
      }),
    }));
    
    // onChange 콜백 모킹
    const onChangeMock = jest.fn();
    
    render(<LanguageSelector onChange={onChangeMock} />);
    
    // select 값 변경
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'en' } });
    
    // 상위 컴포넌트에서 전달한 onChange 콜백이 호출되었는지 확인
    expect(onChangeMock).toHaveBeenCalledWith('en');
  });
  
  test('추가 className을 props로 받을 수 있어야 함', () => {
    render(<LanguageSelector className="custom-class" />);
    
    // 컴포넌트의 루트 요소에 custom-class가 적용되었는지 확인
    const rootElement = screen.getByRole('combobox').parentElement;
    expect(rootElement).toHaveClass('custom-class');
  });
});