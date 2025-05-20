/**
 * @file transactions.test.ts
 * @description 트랜잭션 모듈 테스트
 */

import { 
  TransactionBuilder,
  signTransaction,
  applyGasSettings,
  EstimateGasOptions
} from '../../src/chain/transactions';
import { TransactionType } from '../../src/types/transactions.types';
import { parseEther } from 'ethers';

describe('Transaction Module', () => {
  describe('TransactionBuilder', () => {
    it('should build a basic transaction', () => {
      const fromAddress = '0x1234567890123456789012345678901234567890';
      const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const chainId = 1000; // Catena Mainnet
      
      const builder = new TransactionBuilder(fromAddress, chainId);
      
      const transaction = builder
        .setTo(toAddress)
        .setValue('1000000000000000000') // 1 ETH in wei
        .build();
      
      expect(transaction).toBeDefined();
      expect(transaction.from).toBe(fromAddress);
      expect(transaction.to).toBe(toAddress);
      expect(transaction.value).toBe('1000000000000000000');
      expect(transaction.chainId).toBe(chainId);
      expect(transaction.data).toBe('0x');
    });
    
    it('should build a transaction with ether value', () => {
      const fromAddress = '0x1234567890123456789012345678901234567890';
      const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const chainId = 1;
      
      const builder = new TransactionBuilder(fromAddress, chainId);
      
      const transaction = builder
        .setTo(toAddress)
        .setValueInEther('1.5') // 1.5 ETH
        .build();
      
      expect(transaction).toBeDefined();
      expect(transaction.value).toBe(parseEther('1.5').toString());
    });
    
    it('should build a transaction with data', () => {
      const fromAddress = '0x1234567890123456789012345678901234567890';
      const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const chainId = 1;
      const data = '0xa9059cbb0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a'; // ERC20 transfer
      
      const builder = new TransactionBuilder(fromAddress, chainId);
      
      const transaction = builder
        .setTo(toAddress)
        .setValue('0')
        .setData(data)
        .build();
      
      expect(transaction).toBeDefined();
      expect(transaction.data).toBe(data);
    });
    
    it('should build a transaction with gas settings', () => {
      const fromAddress = '0x1234567890123456789012345678901234567890';
      const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const chainId = 1;
      
      const builder = new TransactionBuilder(fromAddress, chainId);
      
      const transaction = builder
        .setTo(toAddress)
        .setValue('0')
        .setGasLimit('21000')
        .setGasPrice('50000000000') // 50 Gwei
        .build();
      
      expect(transaction).toBeDefined();
      expect(transaction.gasLimit).toBe('21000');
      expect(transaction.gasPrice).toBe('50000000000');
      expect(transaction.type).toBe(TransactionType.LEGACY);
    });
    
    it('should build a transaction with EIP-1559 gas settings', () => {
      const fromAddress = '0x1234567890123456789012345678901234567890';
      const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const chainId = 1;
      
      const builder = new TransactionBuilder(fromAddress, chainId);
      
      const transaction = builder
        .setTo(toAddress)
        .setValue('0')
        .setGasLimit('21000')
        .setEIP1559Gas('100000000000', '2000000000') // 100 Gwei max fee, 2 Gwei max priority fee
        .build();
      
      expect(transaction).toBeDefined();
      expect(transaction.gasLimit).toBe('21000');
      expect(transaction.maxFeePerGas).toBe('100000000000');
      expect(transaction.maxPriorityFeePerGas).toBe('2000000000');
      expect(transaction.type).toBe(TransactionType.EIP1559);
      expect(transaction.gasPrice).toBeUndefined();
    });
    
    it('should throw an error when required fields are missing', () => {
      const builder = new TransactionBuilder('', 1);
      
      expect(() => {
        builder.build();
      }).toThrow(/from address/);
      
      const builderWithFrom = new TransactionBuilder('0x1234567890123456789012345678901234567890', 0);
      
      expect(() => {
        builderWithFrom.build();
      }).toThrow(/chainId/);
      
      const builderWithFromAndChainId = new TransactionBuilder('0x1234567890123456789012345678901234567890', 1);
      
      expect(() => {
        builderWithFromAndChainId.build();
      }).toThrow(/to address or data/);
    });
  });
  
  describe('applyGasSettings', () => {
    it('should apply legacy gas settings', () => {
      const transaction = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '0',
        data: '0x',
        chainId: 1
      };
      
      const gasEstimate = {
        gasLimit: '21000',
        gasPrice: '50000000000',
        type: TransactionType.LEGACY
      };
      
      const updatedTx = applyGasSettings(transaction, gasEstimate);
      
      expect(updatedTx).toBeDefined();
      expect(updatedTx.gasLimit).toBe('21000');
      expect(updatedTx.gasPrice).toBe('50000000000');
      expect(updatedTx.type).toBe(TransactionType.LEGACY);
      expect(updatedTx.maxFeePerGas).toBeUndefined();
      expect(updatedTx.maxPriorityFeePerGas).toBeUndefined();
    });
    
    it('should apply EIP-1559 gas settings', () => {
      const transaction = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '0',
        data: '0x',
        chainId: 1
      };
      
      const gasEstimate = {
        gasLimit: '21000',
        maxFeePerGas: '100000000000',
        maxPriorityFeePerGas: '2000000000',
        type: TransactionType.EIP1559
      };
      
      const updatedTx = applyGasSettings(transaction, gasEstimate);
      
      expect(updatedTx).toBeDefined();
      expect(updatedTx.gasLimit).toBe('21000');
      expect(updatedTx.maxFeePerGas).toBe('100000000000');
      expect(updatedTx.maxPriorityFeePerGas).toBe('2000000000');
      expect(updatedTx.type).toBe(TransactionType.EIP1559);
      expect(updatedTx.gasPrice).toBeUndefined();
    });
  });
  
  // signTransaction 함수는 실제 개인 키가 필요하므로 현재 테스트에서는 모킹없이 테스트하기 어려움
  // 실제 환경에서는 모킹 라이브러리를 사용하여 테스트하는 것이 좋음
});
