import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * NetworksScreen - 네트워크 관리 페이지
 * 
 * 주요 기능:
 * - 현재 추가된 네트워크 목록 표시
 * - 네트워크 추가/수정/삭제
 * - 네트워크 선택
 */
const NetworksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { networks, selectedNetwork, addNetwork, updateNetwork, deleteNetwork, selectNetwork } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNetworkId, setEditNetworkId] = useState<string | null>(null);
  
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    explorerUrl: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
  });
  
  // 편집 시 네트워크 정보 불러오기
  useEffect(() => {
    if (isEditing && editNetworkId) {
      const network = networks?.find(n => n.id === editNetworkId);
      if (network) {
        setNewNetwork({
          name: network.name,
          rpcUrl: network.rpcUrl,
          chainId: network.chainId.toString(),
          symbol: network.symbol,
          explorerUrl: network.explorerUrl || '',
        });
      }
    }
  }, [isEditing, editNetworkId, networks]);
  
  // 네트워크 선택 처리
  const handleSelectNetwork = async (networkId: string) => {
    setIsLoading(true);
    try {
      await selectNetwork(networkId);
    } catch (error) {
      console.error('네트워크 선택 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 네트워크 추가 폼 표시
  const handleShowAddForm = () => {
    setIsAdding(true);
    setIsEditing(false);
    setEditNetworkId(null);
    
    // 폼 초기화
    setNewNetwork({
      name: '',
      rpcUrl: '',
      chainId: '',
      symbol: '',
      explorerUrl: '',
    });
    
    setFormErrors({
      name: '',
      rpcUrl: '',
      chainId: '',
      symbol: '',
    });
  };
  
  // 네트워크 편집 폼 표시
  const handleShowEditForm = (networkId: string) => {
    setIsAdding(false);
    setIsEditing(true);
    setEditNetworkId(networkId);
  };
  
  // 폼 취소
  const handleCancelForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditNetworkId(null);
  };
  
  // 네트워크 삭제
  const handleDeleteNetwork = async (networkId: string) => {
    if (window.confirm('네트워크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsLoading(true);
      try {
        await deleteNetwork(networkId);
      } catch (error) {
        console.error('네트워크 삭제 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      rpcUrl: '',
      chainId: '',
      symbol: '',
    };
    
    let isValid = true;
    
    if (!newNetwork.name.trim()) {
      errors.name = '네트워크 이름을 입력하세요';
      isValid = false;
    }
    
    if (!newNetwork.rpcUrl.trim()) {
      errors.rpcUrl = 'RPC URL을 입력하세요';
      isValid = false;
    } else if (!newNetwork.rpcUrl.startsWith('http://') && !newNetwork.rpcUrl.startsWith('https://')) {
      errors.rpcUrl = 'RPC URL은 http:// 또는 https://로 시작해야 합니다';
      isValid = false;
    }
    
    if (!newNetwork.chainId.trim()) {
      errors.chainId = '체인 ID를 입력하세요';
      isValid = false;
    } else if (!/^\d+$/.test(newNetwork.chainId)) {
      errors.chainId = '체인 ID는 숫자여야 합니다';
      isValid = false;
    }
    
    if (!newNetwork.symbol.trim()) {
      errors.symbol = '통화 기호를 입력하세요';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // 네트워크 저장 (추가 또는 수정)
  const handleSaveNetwork = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isEditing && editNetworkId) {
        await updateNetwork(editNetworkId, {
          name: newNetwork.name,
          rpcUrl: newNetwork.rpcUrl,
          chainId: parseInt(newNetwork.chainId),
          symbol: newNetwork.symbol,
          explorerUrl: newNetwork.explorerUrl || undefined,
        });
      } else {
        await addNetwork({
          name: newNetwork.name,
          rpcUrl: newNetwork.rpcUrl,
          chainId: parseInt(newNetwork.chainId),
          symbol: newNetwork.symbol,
          explorerUrl: newNetwork.explorerUrl || undefined,
        });
      }
      
      // 폼 상태 초기화
      setIsAdding(false);
      setIsEditing(false);
      setEditNetworkId(null);
    } catch (error) {
      console.error('네트워크 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="네트워크 처리 중..." />;
  }
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">네트워크 관리</h1>
        {!isAdding && !isEditing && (
          <Button
            onClick={handleShowAddForm}
            variant="secondary"
          >
            네트워크 추가
          </Button>
        )}
      </div>
      
      {(isAdding || isEditing) ? (
        <Card className="mb-4">
          <h2 className="text-lg font-medium mb-4">
            {isEditing ? '네트워크 편집' : '새 네트워크 추가'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">네트워크 이름</label>
              <Input
                type="text"
                placeholder="Catena 메인넷"
                value={newNetwork.name}
                onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                error={formErrors.name}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">RPC URL</label>
              <Input
                type="text"
                placeholder="https://cvm.node.creatachain.com"
                value={newNetwork.rpcUrl}
                onChange={(e) => setNewNetwork({ ...newNetwork, rpcUrl: e.target.value })}
                error={formErrors.rpcUrl}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">체인 ID</label>
              <Input
                type="text"
                placeholder="1000"
                value={newNetwork.chainId}
                onChange={(e) => setNewNetwork({ ...newNetwork, chainId: e.target.value })}
                error={formErrors.chainId}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">통화 기호</label>
              <Input
                type="text"
                placeholder="CTA"
                value={newNetwork.symbol}
                onChange={(e) => setNewNetwork({ ...newNetwork, symbol: e.target.value })}
                error={formErrors.symbol}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">블록 탐색기 URL (선택)</label>
              <Input
                type="text"
                placeholder="https://catena.explorer.creatachain.com"
                value={newNetwork.explorerUrl}
                onChange={(e) => setNewNetwork({ ...newNetwork, explorerUrl: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={handleCancelForm}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveNetwork}
                className="flex-1"
              >
                저장
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {networks?.map((network) => (
            <Card key={network.id} className={`mb-2 ${network.id === selectedNetwork?.id ? 'border-2 border-blue-500' : ''}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{network.name}</div>
                  <div className="text-sm text-gray-500">
                    {network.rpcUrl}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Chain ID: {network.chainId} • Symbol: {network.symbol}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-end">
                  {network.id === selectedNetwork?.id ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      현재 선택됨
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleSelectNetwork(network.id)}
                      className="text-sm px-3 py-1"
                    >
                      선택
                    </Button>
                  )}
                  
                  <div className="flex space-x-1 mt-2">
                    <button
                      onClick={() => handleShowEditForm(network.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      편집
                    </button>
                    
                    {/* Catena 메인넷과 테스트넷은 삭제 불가 */}
                    {!['catena-mainnet', 'catena-testnet'].includes(network.id) && (
                      <button
                        onClick={() => handleDeleteNetwork(network.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {(!networks || networks.length === 0) && (
            <div className="text-center text-gray-500 py-6">
              등록된 네트워크가 없습니다.
            </div>
          )}
        </div>
      )}
      
      {!isAdding && !isEditing && (
        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md mt-4">
          <div className="text-sm text-yellow-700">
            <div className="font-medium mb-1">네트워크 관리 유의사항</div>
            <ul className="list-disc list-inside text-xs">
              <li>기본 제공되는 Catena 메인넷과 테스트넷은 삭제할 수 없습니다.</li>
              <li>커스텀 네트워크는 신뢰할 수 있는 소스에서만 추가하세요.</li>
              <li>잘못된 RPC URL 설정 시 트랜잭션이 실패할 수 있습니다.</li>
            </ul>
          </div>
        </div>
      )}
      
      {!isAdding && !isEditing && (
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            뒤로 가기
          </Button>
        </div>
      )}
    </div>
  );
};

export default NetworksScreen;