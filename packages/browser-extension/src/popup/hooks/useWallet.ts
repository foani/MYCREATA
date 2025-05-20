/**
 * 지갑 훅
 * 지갑 컨텍스트에 쉽게 접근하기 위한 커스텀 훅
 */

import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

/**
 * 지갑 훅
 * @returns 지갑 컨텍스트 값
 */
export const useWallet = () => {
  return useContext(WalletContext);
};