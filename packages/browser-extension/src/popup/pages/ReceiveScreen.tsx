import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import NetworkSelector from '../components/NetworkSelector';

/**
 * ReceiveScreen - 자산 수신 페이지
 * 
 * 주요 기능:
 * - 현재 계정의 주소 표시
 * - QR 코드 표시
 * - 주소 복사
 * - DID 닉네임 표시 (있는 경우)
 */
const ReceiveScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount, selectedNetwork } = useWallet();
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  
  // 이 계정의 DID 닉네임 (있는 경우)
  const didNickname = selectedAccount?.metadata?.didNickname;
  
  // 주소 복사 기능
  const copyToClipboard = () => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
        });
    }
  };
  
  // QR 코드 생성 (향후 실제 QR 라이브러리로 대체)
  const renderQRCode = () => {
    // 실제 구현에서는 qrcode 라이브러리를 사용할 수 있음
    // 여기서는 간단한 스타일링된 박스로 표현
    return (
      <div className="w-48 h-48 mx-auto bg-white p-2 border border-gray-300 rounded-md">
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-sm text-gray-400">
            QR 코드
            <br />
            (실제 구현 시 대체)
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 h-full">
      <h1 className="text-xl font-bold mb-4">자산 수신</h1>
      
      <div className="mb-4">
        <NetworkSelector />
      </div>
      
      <Card className="mb-4">
        <div className="text-center mb-6">
          {renderQRCode()}
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">내 지갑 주소</label>
          <div 
            ref={addressRef}
            className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all"
          >
            {selectedAccount?.address || '주소를 불러오는 중...'}
          </div>
        </div>
        
        {didNickname && (
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">DID 닉네임</label>
            <div className="bg-gray-100 p-3 rounded-md text-sm">
              @{didNickname}.creata
            </div>
          </div>
        )}
        
        <Button
          onClick={copyToClipboard}
          className="w-full"
        >
          {copied ? '복사됨!' : '주소 복사'}
        </Button>
      </Card>
      
      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md">
        <div className="text-sm text-yellow-700">
          <div className="font-medium mb-1">주의사항</div>
          <ul className="list-disc list-inside text-xs">
            <li>위 주소는 {selectedNetwork?.name} 네트워크 기준입니다.</li>
            <li>지원되는 토큰만 수신 가능합니다.</li>
            <li>다른 네트워크의 토큰을 보내면 자산이 손실될 수 있습니다.</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          뒤로 가기
        </Button>
      </div>
    </div>
  );
};

export default ReceiveScreen;