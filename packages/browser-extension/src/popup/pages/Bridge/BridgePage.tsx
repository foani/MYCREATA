/**
 * 브릿지 페이지
 * 
 * 자산을 다른 체인으로 브릿지(이동)하는 페이지입니다.
 * 
 * @author CreLink Team
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BridgeContainer from '../../components/bridge/BridgeContainer';
import Header from '../../components/Header';

const BridgePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // 이전 페이지로 이동
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex flex-col w-full h-full">
      <Header 
        title={t('bridge.title')}
        leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
        onLeftIconClick={handleBack}
      />
      
      <div className="flex-1 p-4 overflow-auto">
        <BridgeContainer />
      </div>
    </div>
  );
};

export default BridgePage;
