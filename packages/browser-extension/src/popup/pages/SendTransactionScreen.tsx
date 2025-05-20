import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import LoadingScreen from '../components/common/LoadingScreen';
import NetworkSelector from '../components/NetworkSelector';
import { formatUnits, parseUnits } from 'ethers';

/**
 * SendTransactionScreen - 자산 전송 페이지
 * 
 * 주요 기능:
 * - 수신자 주소 입력 (주소 직접 입력, QR 스캔, DID 닉네임 검색)
 * - 토큰 및 금액 설정
 * - 가스비 설정 (빠름, 보통, 저렴)
 * - 트랜잭션 미리보기 및 확인
 * - PIN/생체인증을 통한 서명
 */
const SendTransactionScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAccount, assets, selectedNetwork, sendTransaction, estimateGas } = useWallet();
  
  // 기본값으로 location state에서 토큰 정보를 가져옴 (TokenDetailScreen에서 전달)
  const defaultAsset = location.state?.asset;
  
  // 상태 관리
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(defaultAsset || (assets && assets.length > 0 ? assets[0] : null));
  const [memo, setMemo] = useState('');
  const [gasOption, setGasOption] = useState('medium'); // 'fast', 'medium', 'slow'
  const [gasPrice, setGasPrice] = useState<{ fast: string; medium: string; slow: string }>({
    fast: '0',
    medium: '0',
    slow: '0',
  });
  const [gasLimit, setGasLimit] = useState('21000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  
  // 선택된 자산의 잔액을 가져옴
  const selectedAssetBalance = selectedAsset 
    ? assets?.find(asset => asset.contractAddress === selectedAsset.contractAddress)?.balance || '0'
    : '0';
  
  // 가스비 추정
  useEffect(() => {
    const fetchGasPrice = async () => {
      if (selectedNetwork && selectedAccount) {
        try {
          const gasData = await estimateGas();
          setGasPrice({
            fast: gasData.fast,
            medium: gasData.medium,
            slow: gasData.slow,
          });
        } catch (error) {
          console.error('가스비 추정 실패:', error);
        }
      }
    };
    
    fetchGasPrice();
  }, [selectedNetwork, selectedAccount, estimateGas]);
  
  // 최대 가능 금액 설정 (잔액 - 가스비)
  const handleMaxAmount = () => {
    if (!selectedAsset) return;
    
    // 네이티브 토큰인 경우 가스비 고려
    if (selectedAsset.contractAddress === '') {
      const gasCost = parseUnits(gasPrice[gasOption] || '0', 'gwei').mul(gasLimit);
      const maxAmount = parseUnits(selectedAssetBalance, selectedAsset.decimals).sub(gasCost);
      
      if (maxAmount.lt(0)) {
        setAmount('0');
        setError('잔액이 가스비보다 적습니다');
      } else {
        setAmount(formatUnits(maxAmount, selectedAsset.decimals));
        setError('');
      }
    } else {
      // ERC-20 토큰인 경우 전체 잔액 사용 가능
      setAmount(formatUnits(selectedAssetBalance, selectedAsset.decimals));
      setError('');
    }
  };
  
  // 전송 양식 유효성 검사
  const validateForm = (): boolean => {
    if (!recipient) {
      setError('수신자 주소를 입력하세요');
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('전송 금액을 입력하세요');
      return false;
    }
    
    try {
      const amountInWei = parseUnits(amount, selectedAsset?.decimals || 18);
      const balanceInWei = parseUnits(selectedAssetBalance, selectedAsset?.decimals || 18);
      
      if (amountInWei.gt(balanceInWei)) {
        setError('잔액이 부족합니다');
        return false;
      }
    } catch (error) {
      setError('유효하지 않은 금액입니다');
      return false;
    }
    
    return true;
  };
  
  // 트랜잭션 미리보기로 진행
  const handleContinue = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };
  
  // 트랜잭션 전송
  const handleSend = async () => {
    if (!selectedAsset || !selectedAccount) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const tx = {
        to: recipient,
        value: selectedAsset.contractAddress === '' ? parseUnits(amount, selectedAsset.decimals).toString() : '0',
        gasPrice: parseUnits(gasPrice[gasOption], 'gwei').toString(),
        gasLimit: gasLimit,
        data: selectedAsset.contractAddress !== '' 
          ? `0xa9059cbb${recipient.slice(2).padStart(64, '0')}${parseUnits(amount, selectedAsset.decimals).toString(16).padStart(64, '0')}`
          : '0x',
        chainId: selectedNetwork?.chainId || 1000,
      };
      
      // 토큰 트랜잭션인 경우 컨트랙트 주소 설정
      if (selectedAsset.contractAddress !== '') {
        tx.to = selectedAsset.contractAddress;
      }
      
      const txHash = await sendTransaction(tx);
      
      // 성공 후 활동 내역 페이지로 이동
      navigate('/activity', {
        state: { 
          txHash,
          message: '트랜잭션이 제출되었습니다' 
        }
      });
    } catch (error: any) {
      console.error('트랜잭션 전송 실패:', error);
      setError(error.message || '트랜잭션 전송 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 취소하고 이전 페이지로 돌아가기
  const handleCancel = () => {
    if (step === 'confirm') {
      setStep('form');
    } else {
      navigate(-1);
    }
  };
  
  // QR 스캔 모달 열기 (향후 구현)
  const handleScanQR = () => {
    // QR 스캔 모달 구현 필요
    alert('QR 스캔 기능은 추후 구현 예정입니다');
  };
  
  // DID 닉네임 검색 모달 열기 (향후 구현)
  const handleSearchDID = () => {
    // DID 검색 모달 구현 필요
    alert('DID 검색 기능은 추후 구현 예정입니다');
  };
  
  if (isLoading) {
    return <LoadingScreen message="트랜잭션 처리 중..." />;
  }
  
  if (step === 'form') {
    return (
      <div className="p-4 h-full">
        <h1 className="text-xl font-bold mb-4">자산 전송</h1>
        
        <div className="mb-4">
          <NetworkSelector />
        </div>
        
        <Card className="mb-4">
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">수신자 주소</label>
            <div className="flex">
              <Input
                type="text"
                placeholder="0x... 또는 @nickname.creata"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button 
                variant="secondary" 
                onClick={handleScanQR}
                className="px-2"
              >
                QR
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleSearchDID}
                className="px-2 ml-1"
              >
                @
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">자산</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedAsset?.contractAddress || ''}
              onChange={(e) => {
                const asset = assets?.find(a => a.contractAddress === e.target.value);
                if (asset) {
                  setSelectedAsset(asset);
                }
              }}
            >
              {assets?.map((asset) => (
                <option key={asset.contractAddress || 'native'} value={asset.contractAddress}>
                  {asset.symbol} ({formatUnits(asset.balance, asset.decimals)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600 mb-1 block">금액</label>
              <button 
                className="text-xs text-blue-500"
                onClick={handleMaxAmount}
              >
                최대
              </button>
            </div>
            <div className="flex items-center">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-grow"
              />
              <span className="ml-2 text-gray-600">{selectedAsset?.symbol}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              잔액: {formatUnits(selectedAssetBalance, selectedAsset?.decimals || 18)} {selectedAsset?.symbol}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">메모 (선택사항)</label>
            <Input
              type="text"
              placeholder="트랜잭션 메모"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">가스비</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 text-center rounded-md text-sm ${gasOption === 'fast' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setGasOption('fast')}
              >
                빠름
                <div className="text-xs mt-1">{gasPrice.fast} Gwei</div>
              </button>
              <button
                className={`p-2 text-center rounded-md text-sm ${gasOption === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setGasOption('medium')}
              >
                보통
                <div className="text-xs mt-1">{gasPrice.medium} Gwei</div>
              </button>
              <button
                className={`p-2 text-center rounded-md text-sm ${gasOption === 'slow' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setGasOption('slow')}
              >
                저렴
                <div className="text-xs mt-1">{gasPrice.slow} Gwei</div>
              </button>
            </div>
          </div>
        </Card>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={!selectedAsset || !recipient || !amount}
          >
            계속
          </Button>
        </div>
      </div>
    );
  }
  
  // 확인 화면
  return (
    <div className="p-4 h-full">
      <h1 className="text-xl font-bold mb-4">트랜잭션 확인</h1>
      
      <Card className="mb-4">
        <div className="border-b pb-2 mb-2">
          <div className="text-sm text-gray-600">보내는 주소</div>
          <div className="text-sm font-mono break-all">{selectedAccount?.address}</div>
        </div>
        
        <div className="border-b pb-2 mb-2">
          <div className="text-sm text-gray-600">받는 주소</div>
          <div className="text-sm font-mono break-all">{recipient}</div>
        </div>
        
        <div className="border-b pb-2 mb-2">
          <div className="text-sm text-gray-600">네트워크</div>
          <div>{selectedNetwork?.name}</div>
        </div>
        
        <div className="border-b pb-2 mb-2">
          <div className="text-sm text-gray-600">금액</div>
          <div className="text-lg font-bold">
            {amount} {selectedAsset?.symbol}
          </div>
        </div>
        
        <div className="border-b pb-2 mb-2">
          <div className="text-sm text-gray-600">가스비</div>
          <div>
            {gasPrice[gasOption]} Gwei ({gasOption === 'fast' ? '빠름' : gasOption === 'medium' ? '보통' : '저렴'})
          </div>
        </div>
        
        {memo && (
          <div className="mb-2">
            <div className="text-sm text-gray-600">메모</div>
            <div>{memo}</div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 mt-2">
          이 트랜잭션은 서명 후 취소할 수 없습니다.
        </div>
      </Card>
      
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="flex space-x-4">
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="flex-1"
        >
          뒤로
        </Button>
        <Button
          onClick={handleSend}
          className="flex-1"
        >
          서명 및 전송
        </Button>
      </div>
    </div>
  );
};

export default SendTransactionScreen;