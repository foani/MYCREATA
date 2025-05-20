/**
 * @file keyManagement.test.ts
 * @description 키 관리 모듈 테스트
 */

import { 
  generateMnemonic,
  validateMnemonic,
  createHDWalletFromMnemonic,
  createWalletFromPrivateKey,
  deriveAccount,
  encryptMnemonic,
  decryptMnemonic,
  createKeyring,
  KeyringType
} from '../../src/crypto/keyManagement';

describe('Key Management Module', () => {
  describe('generateMnemonic', () => {
    it('should generate a valid mnemonic', () => {
      const mnemonic = generateMnemonic();
      expect(typeof mnemonic).toBe('string');
      
      // 니모닉은 공백으로 구분된 단어들
      const words = mnemonic.split(' ');
      expect(words.length).toBe(12);
      
      // 니모닉 유효성 검증
      expect(validateMnemonic(mnemonic)).toBe(true);
    });
    
    it('should generate a mnemonic with specified strength', () => {
      const mnemonic24 = generateMnemonic(256);
      const words24 = mnemonic24.split(' ');
      expect(words24.length).toBe(24);
      expect(validateMnemonic(mnemonic24)).toBe(true);
    });
  });
  
  describe('validateMnemonic', () => {
    it('should validate correct mnemonics', () => {
      const mnemonic = generateMnemonic();
      expect(validateMnemonic(mnemonic)).toBe(true);
    });
    
    it('should reject invalid mnemonics', () => {
      // 임의의 단어들
      const invalidMnemonic = 'apple banana cherry dog elephant frog guitar house igloo jelly kite lamp';
      expect(validateMnemonic(invalidMnemonic)).toBe(false);
    });
  });
  
  describe('createHDWalletFromMnemonic', () => {
    it('should create a wallet from mnemonic', () => {
      const mnemonic = generateMnemonic();
      const wallet = createHDWalletFromMnemonic(mnemonic);
      
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      expect(wallet.privateKey).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
    });
    
    it('should create a wallet with a specific path', () => {
      const mnemonic = generateMnemonic();
      const path = "m/44'/60'/0'/0/1";
      const wallet = createHDWalletFromMnemonic(mnemonic, path);
      
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      
      // 같은 니모닉, 다른 경로로 생성한 지갑은 주소가 달라야 함
      const defaultWallet = createHDWalletFromMnemonic(mnemonic);
      expect(wallet.address).not.toEqual(defaultWallet.address);
    });
  });
  
  describe('createWalletFromPrivateKey', () => {
    it('should create a wallet from private key', () => {
      // 테스트용 개인키 생성
      const mnemonic = generateMnemonic();
      const hdWallet = createHDWalletFromMnemonic(mnemonic);
      const privateKey = hdWallet.privateKey;
      
      // 개인키로 지갑 생성
      const wallet = createWalletFromPrivateKey(privateKey);
      
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      expect(wallet.privateKey).toEqual(privateKey);
      
      // 같은 개인키는 같은 주소를 가져야 함
      expect(wallet.address).toEqual(hdWallet.address);
    });
  });
  
  describe('deriveAccount', () => {
    it('should derive an account from mnemonic and index', () => {
      const mnemonic = generateMnemonic();
      const chainId = 1; // Ethereum mainnet
      
      // 첫 번째 계정 파생
      const account0 = deriveAccount(mnemonic, 0, chainId);
      expect(account0).toBeDefined();
      expect(account0.address).toBeDefined();
      expect(account0.privateKey).toBeDefined();
      expect(account0.publicKey).toBeDefined();
      expect(account0.chainId).toBe(chainId);
      expect(account0.index).toBe(0);
      expect(account0.path).toBe("m/44'/60'/0'/0/0");
      
      // 두 번째 계정 파생
      const account1 = deriveAccount(mnemonic, 1, chainId);
      expect(account1.address).not.toEqual(account0.address);
      expect(account1.privateKey).not.toEqual(account0.privateKey);
      expect(account1.index).toBe(1);
      expect(account1.path).toBe("m/44'/60'/0'/0/1");
    });
    
    it('should derive accounts with different chain IDs', () => {
      const mnemonic = generateMnemonic();
      const ethereumChainId = 1;
      const catenaChainId = 1000;
      
      const ethereumAccount = deriveAccount(mnemonic, 0, ethereumChainId);
      const catenaAccount = deriveAccount(mnemonic, 0, catenaChainId);
      
      expect(ethereumAccount.chainId).toBe(ethereumChainId);
      expect(catenaAccount.chainId).toBe(catenaChainId);
      
      // 같은 니모닉, 같은 인덱스이지만 체인 ID가 다르면 주소는 같음
      // BIP-44 경로에서 코인 타입이 다른 경우에만 주소가 달라짐
      expect(ethereumAccount.address).toEqual(catenaAccount.address);
    });
  });
  
  describe('encryptMnemonic and decryptMnemonic', () => {
    it('should encrypt and decrypt a mnemonic with password', () => {
      const mnemonic = generateMnemonic();
      const password = 'test-password-123';
      
      // 암호화
      const encryptedMnemonic = encryptMnemonic(mnemonic, password);
      expect(encryptedMnemonic).toBeDefined();
      expect(encryptedMnemonic).not.toEqual(mnemonic);
      
      // 복호화
      const decryptedMnemonic = decryptMnemonic(encryptedMnemonic, password);
      expect(decryptedMnemonic).toEqual(mnemonic);
    });
    
    it('should throw error when decrypting with wrong password', () => {
      const mnemonic = generateMnemonic();
      const password = 'correct-password';
      const wrongPassword = 'wrong-password';
      
      const encryptedMnemonic = encryptMnemonic(mnemonic, password);
      
      expect(() => {
        decryptMnemonic(encryptedMnemonic, wrongPassword);
      }).toThrow();
    });
  });
  
  describe('createKeyring', () => {
    it('should create an HD keyring with new mnemonic', () => {
      const keyring = createKeyring({
        type: KeyringType.HD,
        count: 3
      });
      
      expect(keyring).toBeDefined();
      expect(keyring.type).toBe(KeyringType.HD);
      expect(keyring.accounts.length).toBe(3);
      expect(keyring.mnemonic).toBeDefined();
      expect(validateMnemonic(keyring.mnemonic)).toBe(true);
    });
    
    it('should create an HD keyring with provided mnemonic', () => {
      const mnemonic = generateMnemonic();
      const keyring = createKeyring({
        type: KeyringType.HD,
        mnemonic,
        count: 2
      });
      
      expect(keyring.mnemonic).toBe(mnemonic);
      expect(keyring.accounts.length).toBe(2);
      
      // 첫 번째 계정은 파생 경로 m/44'/60'/0'/0/0을 사용해야 함
      const hdWallet = createHDWalletFromMnemonic(mnemonic);
      expect(keyring.accounts[0].address).toEqual(hdWallet.address);
    });
    
    it('should create a private key keyring', () => {
      const mnemonic = generateMnemonic();
      const hdWallet = createHDWalletFromMnemonic(mnemonic);
      const privateKey = hdWallet.privateKey;
      
      const keyring = createKeyring({
        type: KeyringType.PRIVATE_KEY,
        privateKey
      });
      
      expect(keyring).toBeDefined();
      expect(keyring.type).toBe(KeyringType.PRIVATE_KEY);
      expect(keyring.accounts.length).toBe(1);
      expect(keyring.mnemonic).toBe('');
      expect(keyring.accounts[0].privateKey).toBe(privateKey);
      expect(keyring.accounts[0].address).toEqual(hdWallet.address);
    });
    
    it('should throw error when private key is missing for PRIVATE_KEY type', () => {
      expect(() => {
        createKeyring({
          type: KeyringType.PRIVATE_KEY
        });
      }).toThrow();
    });
  });
});
