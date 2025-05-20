import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import apiService, { Asset, Transaction } from '../services/api';

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin-right: 16px;
  font-size: 20px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
`;

const BalanceSection = styled.div`
  margin-bottom: 24px;
`;

const TotalBalance = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const TotalBalanceLabel = styled.p`
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 8px;
`;

const TotalBalanceAmount = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const TotalBalanceFiat = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const AssetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const AssetCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: var(--button-color, #3E96FF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  overflow: hidden;
`;

const AssetIconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AssetInfo = styled.div`
  flex: 1;
`;

const AssetName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AssetSymbol = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

const AssetBalance = styled.div`
  text-align: right;
`;

const AssetAmount = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AssetValue = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const NoAssets = styled.div`
  text-align: center;
  padding: 24px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
`;

const NoAssetsText = styled.p`
  font-size: 16px;
  opacity: 0.7;
`;

const TransactionsSection = styled.div`
  margin-bottom: 24px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const TransactionIcon = styled.div<{ type: 'send' | 'receive' | 'swap' | 'approve' | 'other' }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => 
    props.type === 'send' ? '#FF3B30' : 
    props.type === 'receive' ? '#34C759' :
    props.type === 'swap' ? '#5856D6' :
    props.type === 'approve' ? '#FF9500' : '#8E8E93'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  font-size: 20px;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionType = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const TransactionDate = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const TransactionAmount = styled.div`
  text-align: right;
`;

const TransactionValue = styled.h4<{ type: 'send' | 'receive' | 'swap' | 'approve' | 'other' }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => 
    props.type === 'send' ? '#FF3B30' : 
    props.type === 'receive' ? '#34C759' :
    'inherit'
  };
`;

const TransactionToken = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const NoTransactions = styled.div`
  text-align: center;
  padding: 24px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
`;

const NoTransactionsText = styled.p`
  font-size: 16px;
  opacity: 0.7;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

// 송금 모달 컴포넌트
const SendModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--background-color, #ffffff);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ModalHeader = styled.header`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin-right: 16px;
  font-size: 20px;
  cursor: pointer;
`;

const ModalTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
`;

const ModalContent = styled.div`
  padding: 16px;
  flex: 1;
`;

const SendForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 16px;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color, #000000);
`;

const AssetSelector = styled.select`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 16px;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color, #000000);
`;

const SendButton = styled.button`
  background-color: var(--button-color, #3E96FF);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 24px;
  cursor: pointer;
`;

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupMainButton, setupBackButton, hapticFeedback, showPopup, showAlert } = useTelegram();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 송금 모달 관련 상태
  const [showingSendModal, setShowingSendModal] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  
  /**
   * 송금 모달 표시 상태 토글
   */
  const showSendModal = () => {
    // 모달 열 때 초기화
    setSendAddress('');
    setSendAmount('');
    setSelectedAsset(assets[0]?.id || '');
    
    // 모달 상태 변경
    setShowingSendModal(true);
    
    // 백 버튼 동작 변경
    setupBackButton(true, () => {
      setShowingSendModal(false);
    });
    
    // 메인 버튼 숨기기
    setupMainButton('', () => {}, { isVisible: false });
  };
  
  /**
   * 송금 모달 닫기
   */
  const closeSendModal = () => {
    setShowingSendModal(false);
    
    // 백 버튼 동작 변경
    setupBackButton(true, () => {
      navigate('/');
    });
    
    // 메인 버튼 다시 표시
    setupMainButton('Send', () => {
      hapticFeedback('impact', 'medium');
      showSendModal();
    });
  };
  
  /**
   * 송금 처리
   */
  const handleSend = () => {
    if (!sendAddress.trim()) {
      showAlert('Please enter a valid recipient address');
      return;
    }
    
    if (!sendAmount.trim() || parseFloat(sendAmount) <= 0) {
      showAlert('Please enter a valid amount');
      return;
    }
    
    const selectedAssetData = assets.find(asset => asset.id === selectedAsset);
    if (!selectedAssetData) {
      showAlert('Please select an asset');
      return;
    }
    
    // 정규식으로 Ethereum 주소 검증
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(sendAddress)) {
      showAlert('Please enter a valid Ethereum address');
      return;
    }
    
    // 송금 확인 팝업
    showPopup({
      title: 'Confirm Transaction',
      message: `Send ${sendAmount} ${selectedAssetData.symbol} to ${sendAddress.slice(0, 6)}...${sendAddress.slice(-4)}?`,
      buttons: [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Send', type: 'default' }
      ]
    }, (buttonId) => {
      if (buttonId === '1') { // Send 버튼 인덱스
        // 송금 시뮬레이션 (실제로는 API 호출)
        showPopup({
          title: 'Processing',
          message: 'Please wait while we process your transaction...',
          buttons: []
        });
        
        // 성공 시뮬레이션 (2촉 후)
        setTimeout(() => {
          // 새 트랜잭션 추가
          const newTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            hash: `0x${Math.random().toString(16).substring(2, 66)}`,
            timestamp: Date.now(),
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            to: sendAddress,
            value: sendAmount,
            symbol: selectedAssetData.symbol,
            status: 'success',
            type: 'send',
            explorerUrl: `https://catena.explorer.creatachain.com/tx/0x${Math.random().toString(16).substring(2, 66)}`
          };
          
          setTransactions([newTransaction, ...transactions]);
          
          // 성공 팝업
          showPopup({
            title: 'Transaction Successful',
            message: `You've sent ${sendAmount} ${selectedAssetData.symbol} to ${sendAddress.slice(0, 6)}...${sendAddress.slice(-4)}`,
            buttons: [{ text: 'OK', type: 'default' }]
          }, () => {
            // 모달 닫기
            closeSendModal();
          });
          
          hapticFeedback('success');
        }, 2000);
      }
    });
  };

  useEffect(() => {
    // 백버튼 설정
    setupBackButton(true, () => {
      navigate('/');
    });

    // 메인 버튼 설정
    setupMainButton('Send', () => {
      hapticFeedback('impact', 'medium');
      // 송금 기능 구현
      showSendModal();
    });

    // 자산 및 트랜잭션 불러오기
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assetsResponse, transactionsResponse] = await Promise.all([
          apiService.getAssets(),
          apiService.getTransactions({ limit: 5 }),
        ]);

        if (assetsResponse.success && assetsResponse.data) {
          setAssets(assetsResponse.data);
        }

        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        // 테스트용 더미 데이터
        setAssets([
          {
            id: '1',
            symbol: 'CTA',
            name: 'Catena',
            amount: '100',
            decimals: 18,
            isNative: true,
            usdValue: '25.00',
            iconUrl: ''
          },
          {
            id: '2',
            symbol: 'USDT',
            name: 'Tether USD',
            amount: '50',
            decimals: 6,
            tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            usdValue: '50.00',
            iconUrl: ''
          }
        ]);
        setTransactions([
          {
            id: '1',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            timestamp: Date.now() - 86400000, // 어제
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
            value: '10',
            symbol: 'CTA',
            status: 'success',
            type: 'receive',
            explorerUrl: 'https://catena.explorer.creatachain.com/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          },
          {
            id: '2',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            timestamp: Date.now() - 259200000, // 3일 전
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: '5',
            symbol: 'CTA',
            status: 'success',
            type: 'send',
            explorerUrl: 'https://catena.explorer.creatachain.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
          },
          {
            id: '3',
            hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
            timestamp: Date.now() - 432000000, // 5일 전
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            value: '50',
            symbol: 'USDT',
            status: 'success',
            type: 'receive',
            explorerUrl: 'https://catena.explorer.creatachain.com/tx/0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
      setupMainButton('', () => {}, { isVisible: false });
    };
  }, [setupMainButton, setupBackButton, hapticFeedback, navigate]);

  // 총 자산 가치 계산
  const totalBalance = assets.reduce((sum, asset) => {
    const assetValue = asset.usdValue ? parseFloat(asset.usdValue) : 0;
    return sum + assetValue;
  }, 0);

  // 날짜 포맷 함수
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 트랜잭션 타입 아이콘
  const getTransactionIcon = (type: 'send' | 'receive' | 'swap' | 'approve' | 'other'): string => {
    switch (type) {
      case 'send':
        return '↑';
      case 'receive':
        return '↓';
      case 'swap':
        return '↔';
      case 'approve':
        return '✓';
      default:
        return '•';
    }
  };

  return (
    <WalletContainer>
      <Header>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
        <HeaderTitle>Wallet</HeaderTitle>
      </Header>

      <BalanceSection>
        <TotalBalance>
          <TotalBalanceLabel>Total Balance</TotalBalanceLabel>
          <TotalBalanceAmount>{totalBalance.toFixed(2)} USD</TotalBalanceAmount>
          <TotalBalanceFiat>{assets.find(a => a.symbol === 'CTA')?.amount || '0'} CTA</TotalBalanceFiat>
        </TotalBalance>
      </BalanceSection>

      <SectionTitle>Assets</SectionTitle>
      {loading ? (
        <LoadingIndicator>
          <div className="loader"></div>
        </LoadingIndicator>
      ) : assets.length > 0 ? (
        <AssetsList>
          {assets.map((asset) => (
            <AssetCard key={asset.id}>
              <AssetIcon>
                {asset.iconUrl ? (
                  <AssetIconImage 
                    src={asset.iconUrl} 
                    alt={asset.symbol}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://crelink.io/token-placeholder.png';
                    }} 
                  />
                ) : (
                  asset.symbol.charAt(0)
                )}
              </AssetIcon>
              <AssetInfo>
                <AssetName>{asset.name}</AssetName>
                <AssetSymbol>{asset.symbol}</AssetSymbol>
              </AssetInfo>
              <AssetBalance>
                <AssetAmount>{asset.amount}</AssetAmount>
                <AssetValue>${asset.usdValue || '0.00'}</AssetValue>
              </AssetBalance>
            </AssetCard>
          ))}
        </AssetsList>
      ) : (
        <NoAssets>
          <NoAssetsText>No assets found in your wallet</NoAssetsText>
        </NoAssets>
      )}

      <SectionTitle>Recent Transactions</SectionTitle>
      {loading ? (
        <LoadingIndicator>
          <div className="loader"></div>
        </LoadingIndicator>
      ) : transactions.length > 0 ? (
        <TransactionsSection>
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id}>
              <TransactionIcon type={transaction.type}>
                {getTransactionIcon(transaction.type)}
              </TransactionIcon>
              <TransactionInfo>
                <TransactionType>{transaction.type}</TransactionType>
                <TransactionDate>{formatDate(transaction.timestamp)}</TransactionDate>
              </TransactionInfo>
              <TransactionAmount>
                <TransactionValue type={transaction.type}>
                  {transaction.type === 'send' ? '-' : transaction.type === 'receive' ? '+' : ''}
                  {transaction.value}
                </TransactionValue>
                <TransactionToken>{transaction.symbol}</TransactionToken>
              </TransactionAmount>
            </TransactionItem>
          ))}
        </TransactionsSection>
      ) : (
        <NoTransactions>
          <NoTransactionsText>No transactions yet</NoTransactionsText>
        </NoTransactions>
      )}
      
      {/* 송금 모달 */}
      {showingSendModal && (
        <SendModal>
          <ModalHeader>
            <ModalCloseButton onClick={closeSendModal}>←</ModalCloseButton>
            <ModalTitle>Send Assets</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <SendForm>
              <FormGroup>
                <InputLabel>Recipient Address</InputLabel>
                <Input 
                  type="text" 
                  placeholder="Enter Ethereum address (0x...)" 
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <InputLabel>Asset</InputLabel>
                <AssetSelector 
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.symbol} - {asset.name} (Balance: {asset.amount})
                    </option>
                  ))}
                </AssetSelector>
              </FormGroup>
              
              <FormGroup>
                <InputLabel>Amount</InputLabel>
                <Input 
                  type="number" 
                  placeholder="Enter amount to send" 
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                />
              </FormGroup>
              
              <SendButton onClick={handleSend}>
                Send
              </SendButton>
            </SendForm>
          </ModalContent>
        </SendModal>
      )}
    </WalletContainer>
  );
};

export default WalletPage;
