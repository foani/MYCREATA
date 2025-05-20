import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingScreen from '../components/common/LoadingScreen';
import { formatUnits } from 'ethers';

/**
 * ApprovalScreen - DApp 요청 승인 페이지
 * 
 * 주요 기능:
 * - 다양한 DApp 요청 처리 (연결, 서명, 트랜잭션 등)
 * - 요청 내용 시각화
 * - 사용자 승인 또는 거절
 * - 스마트 컨트랙트 상호작용 분석
 */
const ApprovalScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAccount, selectedNetwork, approveRequest, rejectRequest, estimateGas } = useWallet();
  
  // location state에서 요청 정보 가져오기
  const request = location.state?.request;
  const requestId = location.state?.requestId;
  const origin = location.state?.origin || 'Unknown DApp';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gasDetails, setGasDetails] = useState<any>(null);
  
  // 요청이 없으면 잘못된 접근으로 간주
  useEffect(() => {
    if (!request || !requestId) {
      navigate('/');
    }
  }, [request, requestId, navigate]);
  
  // 가스 정보 추정 (트랜잭션 요청인 경우)
  useEffect(() => {
    const fetchGasDetails = async () => {
      if (request?.method === 'eth_sendTransaction' && selectedNetwork) {
        try {
          // 가스 추정
          const gas = await estimateGas(request.params[0]);
          setGasDetails(gas);
        } catch (err) {
          console.error('가스 추정 실패:', err);
          // 가스 추정이 실패해도 완전히 막지는 않음
        }
      }
    };
    
    fetchGasDetails();
  }, [request, selectedNetwork, estimateGas]);
  
  // 요청 승인 처리
  const handleApprove = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await approveRequest(requestId);
      // 응답 후 지갑 홈으로 돌아가기
      navigate('/');
    } catch (err: any) {
      console.error('요청 승인 실패:', err);
      setError(err.message || '요청 처리 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };
  
  // 요청 거절 처리
  const handleReject = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    
    try {
      await rejectRequest(requestId);
      // 응답 후 지갑 홈으로 돌아가기
      navigate('/');
    } catch (err) {
      console.error('요청 거절 실패:', err);
      // 거절 실패해도 홈으로 이동
      navigate('/');
    }
  };
  
  // 요청 타입에 따라 제목 지정
  const getRequestTitle = () => {
    if (!request) return '요청 처리';
    
    switch (request.method) {
      case 'eth_requestAccounts':
        return '연결 요청';
      case 'eth_sendTransaction':
        return '트랜잭션 요청';
      case 'personal_sign':
        return '메시지 서명 요청';
      case 'eth_signTypedData_v4':
        return '타입 데이터 서명 요청';
      case 'wallet_switchEthereumChain':
        return '네트워크 전환 요청';
      case 'wallet_addEthereumChain':
        return '네트워크 추가 요청';
      default:
        return `${request.method} 요청`;
    }
  };
  
  // 계정 연결 요청 렌더링
  const renderConnectionRequest = () => {
    return (
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            {/* DApp 로고 자리 (향후 구현) */}
            <div className="text-gray-500">Logo</div>
          </div>
          <div className="font-medium">{origin}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">요청 내용</div>
          <div className="font-medium">계정 연결 요청</div>
          <div className="text-sm text-gray-500 mt-1">
            이 DApp에 현재 활성화된 계정 주소를 제공합니다.
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">연결할 계정</div>
          <div className="font-medium">{selectedAccount?.name}</div>
          <div className="text-sm font-mono">{selectedAccount?.address}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 mb-1">네트워크</div>
          <div className="font-medium">{selectedNetwork?.name}</div>
        </div>
      </Card>
    );
  };
  
  // 트랜잭션 요청 렌더링
  const renderTransactionRequest = () => {
    if (!request || !request.params || !request.params[0]) {
      return <div>잘못된 트랜잭션 요청</div>;
    }
    
    const tx = request.params[0];
    const isCatenaToken = !tx.data || tx.data === '0x';
    
    // 트랜잭션 값을 단위에 맞게 변환
    const formatValue = () => {
      if (!tx.value) return '0';
      
      try {
        return formatUnits(tx.value, 18); // 기본적으로 18 decimals 사용
      } catch (err) {
        return tx.value;
      }
    };
    
    return (
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            {/* DApp 로고 자리 (향후 구현) */}
            <div className="text-gray-500">Logo</div>
          </div>
          <div className="font-medium">{origin}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">요청 내용</div>
          <div className="font-medium">트랜잭션 서명 요청</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">발신자</div>
          <div className="text-sm font-mono break-all">{tx.from}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">수신자</div>
          <div className="text-sm font-mono break-all">{tx.to}</div>
        </div>
        
        {isCatenaToken && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">금액</div>
            <div className="font-medium">
              {formatValue()} {selectedNetwork?.symbol}
            </div>
          </div>
        )}
        
        {!isCatenaToken && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">컨트랙트 호출</div>
            <div className="text-sm text-gray-500">
              컨트랙트 인터랙션이 감지되었습니다.
            </div>
            <div className="text-xs font-mono break-all bg-gray-100 p-2 rounded-md mt-1 h-20 overflow-auto">
              {tx.data}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">가스비</div>
          {gasDetails ? (
            <div>
              <div className="font-medium">
                {gasDetails.gasPrice} Gwei
              </div>
              <div className="text-xs text-gray-500">
                최대 가스비: ~{gasDetails.maxFeeEth} {selectedNetwork?.symbol}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              가스비 추정 중...
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 mb-1">네트워크</div>
          <div className="font-medium">{selectedNetwork?.name}</div>
        </div>
      </Card>
    );
  };
  
  // 메시지 서명 요청 렌더링
  const renderSignMessageRequest = () => {
    if (!request || !request.params) {
      return <div>잘못된 서명 요청</div>;
    }
    
    // personal_sign의 경우 메시지는 두 번째 파라미터(인덱스 1)에 있음
    const message = request.method === 'personal_sign' ? request.params[0] : JSON.stringify(request.params, null, 2);
    
    // 메시지가 hex라면 디코딩 시도
    let decodedMessage = message;
    if (message && message.startsWith('0x')) {
      try {
        // 16진수 문자열을 바이트 배열로 변환
        const hexToBytes = (hex: string) => {
          const bytes = [];
          for (let i = 2; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substring(i, i + 2), 16));
          }
          return bytes;
        };
        
        const bytes = hexToBytes(message);
        decodedMessage = new TextDecoder().decode(new Uint8Array(bytes));
      } catch (err) {
        console.error('메시지 디코딩 실패:', err);
        // 디코딩 실패 시 원본 메시지 사용
      }
    }
    
    return (
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            {/* DApp 로고 자리 (향후 구현) */}
            <div className="text-gray-500">Logo</div>
          </div>
          <div className="font-medium">{origin}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">요청 내용</div>
          <div className="font-medium">메시지 서명 요청</div>
          <div className="text-sm text-gray-500 mt-1">
            아래 메시지에 대한 서명을 요청합니다. 주의: 이 메시지를 이해하지 못하면 서명하지 마세요.
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">메시지</div>
          <div className="text-sm font-mono break-all bg-gray-100 p-2 rounded-md mt-1 max-h-40 overflow-auto">
            {decodedMessage}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">서명자</div>
          <div className="font-medium">{selectedAccount?.name}</div>
          <div className="text-sm font-mono">{selectedAccount?.address}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 mb-1">네트워크</div>
          <div className="font-medium">{selectedNetwork?.name}</div>
        </div>
      </Card>
    );
  };
  
  // 체인 전환 요청 렌더링
  const renderSwitchChainRequest = () => {
    if (!request || !request.params) {
      return <div>잘못된 네트워크 전환 요청</div>;
    }
    
    const chainId = request.params[0]?.chainId;
    let chainName = `Chain ID: ${chainId}`;
    
    // 알려진 체인 ID인 경우 이름 표시
    if (chainId === '0x3E8' || chainId === '1000') {
      chainName = 'Catena 메인넷';
    } else if (chainId === '0x2328' || chainId === '9000') {
      chainName = 'Catena 테스트넷';
    }
    
    return (
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            {/* DApp 로고 자리 (향후 구현) */}
            <div className="text-gray-500">Logo</div>
          </div>
          <div className="font-medium">{origin}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">요청 내용</div>
          <div className="font-medium">네트워크 전환 요청</div>
          <div className="text-sm text-gray-500 mt-1">
            DApp이 다음 네트워크로 전환을 요청합니다:
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">전환할 네트워크</div>
          <div className="font-medium">{chainName}</div>
          <div className="text-sm text-gray-500 mt-1">
            Chain ID: {chainId}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 mb-1">현재 네트워크</div>
          <div className="font-medium">{selectedNetwork?.name}</div>
        </div>
      </Card>
    );
  };
  
  // 체인 추가 요청 렌더링
  const renderAddChainRequest = () => {
    if (!request || !request.params || !request.params[0]) {
      return <div>잘못된 네트워크 추가 요청</div>;
    }
    
    const chainParams = request.params[0];
    
    return (
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            {/* DApp 로고 자리 (향후 구현) */}
            <div className="text-gray-500">Logo</div>
          </div>
          <div className="font-medium">{origin}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">요청 내용</div>
          <div className="font-medium">네트워크 추가 요청</div>
          <div className="text-sm text-gray-500 mt-1">
            DApp이 다음 네트워크 추가를 요청합니다:
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">네트워크 이름</div>
          <div className="font-medium">{chainParams.chainName}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">Chain ID</div>
          <div className="font-medium">{chainParams.chainId}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">RPC URL</div>
          <div className="text-sm break-all">{chainParams.rpcUrls[0]}</div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">통화 기호</div>
          <div className="font-medium">{chainParams.nativeCurrency?.symbol || '없음'}</div>
        </div>
        
        {chainParams.blockExplorerUrls && chainParams.blockExplorerUrls[0] && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 mb-1">블록 탐색기 URL</div>
            <div className="text-sm break-all">{chainParams.blockExplorerUrls[0]}</div>
          </div>
        )}
      </Card>
    );
  };
  
  // 요청 타입에 따라 적절한 컴포넌트 렌더링
  const renderRequestDetails = () => {
    if (!request) return null;
    
    switch (request.method) {
      case 'eth_requestAccounts':
        return renderConnectionRequest();
      case 'eth_sendTransaction':
        return renderTransactionRequest();
      case 'personal_sign':
      case 'eth_signTypedData_v4':
        return renderSignMessageRequest();
      case 'wallet_switchEthereumChain':
        return renderSwitchChainRequest();
      case 'wallet_addEthereumChain':
        return renderAddChainRequest();
      default:
        return (
          <Card className="mb-4">
            <div className="text-center mb-4">
              <div className="font-medium">{origin}</div>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">요청 내용</div>
              <div className="font-medium">{request.method} 요청</div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600 mb-1">파라미터</div>
              <div className="text-sm font-mono break-all bg-gray-100 p-2 rounded-md mt-1 max-h-40 overflow-auto">
                {JSON.stringify(request.params, null, 2)}
              </div>
            </div>
          </Card>
        );
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="요청 처리 중..." />;
  }
  
  if (!request || !requestId) {
    return <LoadingScreen message="요청 정보 로드 중..." />;
  }
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">{getRequestTitle()}</h1>
      
      {renderRequestDetails()}
      
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="flex space-x-4">
        <Button
          variant="secondary"
          onClick={handleReject}
          className="flex-1"
        >
          거절
        </Button>
        <Button
          onClick={handleApprove}
          className="flex-1"
        >
          승인
        </Button>
      </div>
    </div>
  );
};

export default ApprovalScreen;