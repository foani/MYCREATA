// Jest DOM 확장 기능 추가
require('@testing-library/jest-dom');

// 로컬 스토리지 모킹
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// window.matchMedia 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 이전 버전 호환성
    removeListener: jest.fn(), // 이전 버전 호환성
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// window.crypto.getRandomValues 모킹
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: arr => {
      return new Uint8Array(arr.length).fill(0).map((_, i) => i % 255);
    },
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Chrome API 모킹
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
};

// localStorage 및 sessionStorage 모킹
global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();

// react-i18next 모킹
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (key) => key,
      i18n: {
        changeLanguage: jest.fn(),
        language: 'ko',
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// console 에러 무시 옵션 (필요시 주석 해제)
// console.error = jest.fn();
// console.warn = jest.fn();