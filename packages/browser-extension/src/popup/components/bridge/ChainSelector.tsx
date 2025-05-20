/**
 * 체인 선택기 컴포넌트
 * 
 * 브릿지 과정에서 대상 체인을 선택할 수 있는 드롭다운 컴포넌트입니다.
 * 
 * @author CreLink Team
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChainType } from '../../../../core/src/chain/chains';

interface ChainSelectorProps {
  currentChain: ChainType;
  availableChains: ChainType[];
  onChange: (chain: ChainType) => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  currentChain,
  availableChains,
  onChange
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // 체인 변경 핸들러
  const handleChainChange = (chain: ChainType) => {
    onChange(chain);
    setIsOpen(false);
  };
  
  // 체인 정보
  const chainInfo = {
    [ChainType.CATENA]: {
      name: 'Catena',
      icon: '/assets/chains/catena.svg',
      description: t('chains.catena.description')
    },
    [ChainType.ETHEREUM]: {
      name: 'Ethereum',
      icon: '/assets/chains/ethereum.svg',
      description: t('chains.ethereum.description')
    },
    [ChainType.POLYGON]: {
      name: 'Polygon',
      icon: '/assets/chains/polygon.svg',
      description: t('chains.polygon.description')
    },
    [ChainType.ARBITRUM]: {
      name: 'Arbitrum',
      icon: '/assets/chains/arbitrum.svg',
      description: t('chains.arbitrum.description')
    }
  };
  
  return (
    <div className="relative">
      {/* 선택된 체인 표시 */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md"
      >
        <div className="flex items-center">
          <img
            src={chainInfo[currentChain].icon}
            alt={chainInfo[currentChain].name}
            className="w-6 h-6 mr-2"
          />
          <span>{chainInfo[currentChain].name}</span>
        </div>
        <ChevronDownIcon className="w-5 h-5" />
      </button>
      
      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-md shadow-lg">
          <ul className="py-1">
            {availableChains.map(chain => (
              <li key={chain}>
                <button
                  type="button"
                  onClick={() => handleChainChange(chain)}
                  className="w-full flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <img
                    src={chainInfo[chain].icon}
                    alt={chainInfo[chain].name}
                    className="w-6 h-6 mr-2"
                  />
                  <div className="flex flex-col text-left">
                    <span>{chainInfo[chain].name}</span>
                    <span className="text-xs text-gray-500">
                      {chainInfo[chain].description}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChainSelector;
