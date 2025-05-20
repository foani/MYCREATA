import React, { useState } from 'react';
import { CreLinkProvider, useCreLink } from './CreLinkProvider';
import WalletButton from './WalletButton';

// 트랜잭션 양식 인터페이스
interface TransactionForm {
  to: string;
  value: string;
  data?: string;
}

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const { 
    isConnected, 
    accounts, 
    chainId, 
    balance, 
    error,
    sendTransaction,
    signMessage,
    switchChain
  } = useCreLink();

  // 메시지 상태 관리
  const [message, setMessage] = useState<string>('Hello CreLink!');
  const [signature, setSignature] = useState<string>('');
  
  // 트랜잭션 상태 관리
  const [txForm, setTxForm] = useState<TransactionForm>({
    to: '',
    value: '0.001',
    data: '0x'
  });
  const [txHash, setTxHash] = useState<string>('');
  
  // 체인 변경 상태 관리
  const [targetChainId, setTargetChainId] = useState<string>('0x3E8'); // Catena 메인넷 (CIP-20) 기본값

  // 메시지 서명 핸들러
  const handleSignMessage = async () => {
    if (!message) return;
    
    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (err) {
      console.error('Error signing message:', err);
    }
  };

  // 트랜잭션 전송 핸들러
  const handleSendTransaction = async () => {
    try {
      // 이더 양을 Wei로 변환 (간단한 구현. 실제로는 ethers.js의 parseEther 사용 권장)
      const valueInWei = String(Number(txForm.value) * 1e18);
      
      const txData = {
        to: txForm.to,
        from: accounts[0],
        value: '0x' + Number(valueInWei).toString(16), // 16진수로 변환
        data: txForm.data || '0x'
      };
      
      const hash = await sendTransaction(txData);
      setTxHash(hash);
    } catch (err) {
      console.error('Error sending transaction:', err);
    }
  };

  // 체인 변경 핸들러
  const handleSwitchChain = async () => {
    try {
      await switchChain(targetChainId);
    } catch (err) {
      console.error('Error switching chain:', err);
    }
  };

  // 계정 연결 안 된 경우 표시할 내용
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold">CreLink Example App</h1>
        <p className="text-gray-600">Connect your CreLink wallet to get started</p>
        <WalletButton variant="primary" />
        {error && (
          <div className="mt-2 text-sm text-red-600">
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }

  // 연결된 상태일 때 표시할 내용
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CreLink Example App</h1>
        <WalletButton variant="outline" />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 지갑 정보 카드 */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Wallet Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Address:</span>{' '}
              <code className="bg-gray-100 p-1 rounded">{accounts[0]}</code>
            </p>
            <p>
              <span className="font-medium">Chain ID:</span>{' '}
              <code className="bg-gray-100 p-1 rounded">{chainId}</code>
            </p>
            <p>
              <span className="font-medium">Balance:</span>{' '}
              {balance ? (
                <span>{(parseInt(balance, 16) / 1e18).toFixed(4)} ETH</span>
              ) : (
                <span>Loading...</span>
              )}
            </p>
          </div>
        </div>
        
        {/* 체인 변경 카드 */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Switch Chain</h2>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chain ID (hex)
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={targetChainId}
                onChange={(e) => setTargetChainId(e.target.value)}
              >
                <option value="0x3E8">Catena (CIP-20) Mainnet (0x3E8)</option>
                <option value="0x2328">Catena (CIP-20) Testnet (0x2328)</option>
                <option value="0x89">Polygon Mainnet (0x89)</option>
                <option value="0x13881">Polygon Mumbai Testnet (0x13881)</option>
                <option value="0xa4b1">Arbitrum One (0xa4b1)</option>
              </select>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleSwitchChain}
            >
              Switch Chain
            </button>
          </div>
        </div>
        
        {/* 메시지 서명 카드 */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Sign Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleSignMessage}
              disabled={!message}
            >
              Sign Message
            </button>
            {signature && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  rows={3}
                  readOnly
                  value={signature}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 트랜잭션 전송 카드 */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Send Transaction</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                value={txForm.to}
                onChange={(e) => setTxForm({ ...txForm, to: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ETH)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={txForm.value}
                onChange={(e) => setTxForm({ ...txForm, value: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data (optional, hex)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                value={txForm.data}
                onChange={(e) => setTxForm({ ...txForm, data: e.target.value })}
              />
            </div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleSendTransaction}
              disabled={!txForm.to}
            >
              Send Transaction
            </button>
            {txHash && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Hash
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                    readOnly
                    value={txHash}
                  />
                  <button
                    className="ml-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                    onClick={() => {
                      navigator.clipboard.writeText(txHash);
                      alert('Transaction hash copied to clipboard!');
                    }}
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 루트 앱 컴포넌트
const ExampleApp: React.FC = () => {
  return (
    <CreLinkProvider autoConnect={false}>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </CreLinkProvider>
  );
};

export default ExampleApp;
