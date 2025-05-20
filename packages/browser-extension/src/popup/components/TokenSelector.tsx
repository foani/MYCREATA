/**
 * 토큰 선택기 컴포넌트
 * 
 * 사용자가 토큰 목록에서 토큰을 선택할 수 있는 UI 컴포넌트입니다.
 * 
 * @author CreLink Team
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { convertFromWei } from '../../../core/src/utils/conversion';
import Input from './common/Input';

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  logoURI?: string;
}

interface TokenSelectorProps {
  tokens: TokenInfo[];
  selectedToken: string;
  onSelectToken: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  placeholder = 'Select token',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 현재 선택된 토큰 정보 가져오기
  const selectedTokenInfo = tokens.find(token => token.address === selectedToken);
  
  // 드롭다운 토글
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };
  
  // 토큰 선택 핸들러
  const handleSelectToken = (address: string) => {
    onSelectToken(address);
    setIsOpen(false);
  };
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // 검색 결과 필터링
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* 선택된 토큰 표시 또는 기본 선택 버튼 */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {selectedTokenInfo ? (
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex items-center justify-center overflow-hidden">
              {selectedTokenInfo.logoURI ? (
                <img
                  src={selectedTokenInfo.logoURI}
                  alt={selectedTokenInfo.symbol}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold">
                  {selectedTokenInfo.symbol.substring(0, 2)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedTokenInfo.symbol}</span>
              <span className="text-xs text-gray-500">{selectedTokenInfo.name}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </button>
      
      {/* 토큰 선택 드롭다운 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-md shadow-lg max-h-80 overflow-auto">
          {/* 검색 입력란 */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder={t('tokenSelector.search')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
          
          {/* 토큰 목록 */}
          <ul className="py-1">
            {filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <li key={token.address}>
                  <button
                    type="button"
                    onClick={() => handleSelectToken(token.address)}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      token.address === selectedToken ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex items-center justify-center overflow-hidden">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {token.symbol.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-xs text-gray-500">{token.name}</span>
                      </div>
                    </div>
                    
                    {token.balance && (
                      <span className="text-sm font-medium">
                        {convertFromWei(token.balance, token.decimals)}
                      </span>
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-gray-500">
                {t('tokenSelector.noResults')}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
