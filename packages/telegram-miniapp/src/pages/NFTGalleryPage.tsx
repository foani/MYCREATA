import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import apiService, { NFT } from '../services/api';

const Container = styled.div`
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

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const NFTCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover, &:active {
    transform: translateY(-2px);
  }
`;

const NFTImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
`;

const NFTImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NFTImagePlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const NFTInfo = styled.div`
  padding: 12px;
`;

const NFTName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NFTCollection = styled.p`
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyNFT = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
`;

const EmptyNFTText = styled.p`
  font-size: 16px;
  opacity: 0.7;
  margin-bottom: 16px;
`;

const EmptyNFTSubText = styled.p`
  font-size: 14px;
  opacity: 0.5;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const NFTModal = styled.div`
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

const NFTLargeImage = styled.img`
  width: 100%;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const NFTDetailTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const NFTDetailCollection = styled.p`
  font-size: 16px;
  opacity: 0.7;
  margin-bottom: 16px;
`;

const NFTDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const NFTAttributesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const NFTAttributesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const NFTAttributeCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 8px;
  padding: 12px;
`;

const NFTAttributeType = styled.p`
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 4px;
`;

const NFTAttributeValue = styled.p`
  font-size: 14px;
  font-weight: 600;
`;

const NFTDetailsSection = styled.div`
  margin-bottom: 24px;
`;

const NFTDetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const NFTDetailLabel = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

const NFTDetailValue = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const NFTViewButton = styled.a`
  display: block;
  flex: 1;
  text-align: center;
  background-color: var(--button-color, #3E96FF);
  color: white;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  text-decoration: none;
`;

const NFTTransferButton = styled.button`
  flex: 1;
  text-align: center;
  background-color: transparent;
  color: var(--button-color, #3E96FF);
  border: 1px solid var(--button-color, #3E96FF);
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const TransferFormContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
`;

const TransferFormTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const TransferInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  font-size: 14px;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color, #000000);
`;

const TransferButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const TransferSubmitButton = styled.button`
  flex: 1;
  background-color: var(--button-color, #3E96FF);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const TransferCancelButton = styled.button`
  flex: 1;
  background-color: transparent;
  color: var(--text-color, #000000);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
`;

/**
 * NFT 갤러리 페이지 컴포넌트
 * 사용자가 소유한 NFT를 갤러리 형태로 표시합니다.
 */
const NFTGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupBackButton, hapticFeedback, showPopup, showAlert } = useTelegram();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState('');

  useEffect(() => {
    // 백버튼 설정
    setupBackButton(true, () => {
      if (selectedNFT) {
        // 선택된 NFT가 있으면 모달 닫기
        setSelectedNFT(null);
      } else {
        // 아니면 메인 페이지로 이동
        navigate('/');
      }
    });

    // NFT 데이터 불러오기
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const response = await apiService.getNFTs();
        if (response.success && response.data) {
          setNfts(response.data);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        // 테스트용 더미 데이터
        setNfts([
          {
            id: '1',
            tokenId: '1',
            name: 'Early Adopter',
            description: 'This NFT represents that you were one of the first to join CreLink ecosystem. It provides extra benefits and rewards for early adopters.',
            imageUrl: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1.png',
            contractAddress: '0x8a90cab2b38dba80c64b7e645f6c8bc6582390cb',
            contractName: 'CreLink Early Adopters',
            collectionName: 'CreLink Membership',
            attributes: [
              {
                trait_type: 'Rarity',
                value: 'Rare'
              },
              {
                trait_type: 'Type',
                value: 'Membership'
              },
              {
                trait_type: 'Boost',
                value: '+10% Rewards'
              }
            ]
          },
          {
            id: '2',
            tokenId: '42',
            name: 'Mission Master',
            description: 'Awarded to users who completed all the initial missions. This NFT grants access to exclusive events and airdrops.',
            imageUrl: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/2.png',
            contractAddress: '0x8a90cab2b38dba80c64b7e645f6c8bc6582390cd',
            contractName: 'CreLink Achievements',
            collectionName: 'CreLink Achievements',
            attributes: [
              {
                trait_type: 'Rarity',
                value: 'Epic'
              },
              {
                trait_type: 'Type',
                value: 'Achievement'
              },
              {
                trait_type: 'Boost',
                value: 'Special Mission Access'
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
    };
  }, [setupBackButton, navigate]);

  /**
   * NFT 상세 보기 모달 열기
   */
  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
    hapticFeedback('impact', 'light');
  };

  /**
   * NFT 상세 보기 모달 닫기
   */
  const handleCloseModal = () => {
    setSelectedNFT(null);
    hapticFeedback('impact', 'light');
  };

  /**
   * NFT 주소 줄임 표시
   */
  const shortenAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  /**
   * NFT 전송 폼 표시 토글
   */
  const toggleTransferForm = () => {
    setShowTransferForm(!showTransferForm);
    // 폼 초기화
    if (!showTransferForm) {
      setReceiverAddress('');
    }
    hapticFeedback('impact', 'light');
  };
  
  /**
   * NFT 전송 처리
   */
  const handleTransferNFT = () => {
    if (!selectedNFT) return;
    if (!receiverAddress.trim()) {
      showAlert('Please enter a valid receiver address');
      return;
    }
    
    // 정규식으로 Ethereum 주소 검증
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(receiverAddress)) {
      showAlert('Please enter a valid Ethereum address');
      return;
    }
    
    // 전송 확인 팝업
    showPopup({
      title: 'Confirm Transfer',
      message: `Are you sure you want to transfer "${selectedNFT.name}" to ${shortenAddress(receiverAddress)}?`,
      buttons: [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Transfer', type: 'default' }
      ]
    }, (buttonId) => {
      if (buttonId === '1') { // Transfer 버튼 인덱스
        // 전송 시뮬레이션 (실제로는 API 호출)
        showPopup({
          title: 'Transfer in Progress',
          message: 'Please wait while we process your transfer...',
          buttons: []
        });
        
        // 성공 시뮬레이션 (2초 후)
        setTimeout(() => {
          // 성공 팝업
          showPopup({
            title: 'Transfer Complete',
            message: `Successfully transferred "${selectedNFT.name}" to ${shortenAddress(receiverAddress)}`,
            buttons: [{ text: 'OK', type: 'default' }]
          }, () => {
            // NFT 목록에서 제거 (전송했으므로)
            setNfts(nfts.filter(nft => nft.id !== selectedNFT.id));
            // 모달 닫기
            setSelectedNFT(null);
            setShowTransferForm(false);
          });
          
          hapticFeedback('success');
        }, 2000);
      }
    });
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
        <HeaderTitle>NFT Gallery</HeaderTitle>
      </Header>

      {loading ? (
        <LoadingIndicator>
          <div className="loader"></div>
        </LoadingIndicator>
      ) : nfts.length > 0 ? (
        <NFTGrid>
          {nfts.map((nft) => (
            <NFTCard key={nft.id} onClick={() => handleNFTClick(nft)}>
              <NFTImageContainer>
                {nft.imageUrl ? (
                  <NFTImage 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const container = target.parentElement as HTMLElement;
                      const placeholder = document.createElement('div');
                      placeholder.className = 'nft-placeholder';
                      placeholder.style.position = 'absolute';
                      placeholder.style.top = '0';
                      placeholder.style.left = '0';
                      placeholder.style.width = '100%';
                      placeholder.style.height = '100%';
                      placeholder.style.display = 'flex';
                      placeholder.style.alignItems = 'center';
                      placeholder.style.justifyContent = 'center';
                      placeholder.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                      placeholder.style.fontSize = '32px';
                      placeholder.innerText = '🖼️';
                      container.appendChild(placeholder);
                    }}
                  />
                ) : (
                  <NFTImagePlaceholder>🖼️</NFTImagePlaceholder>
                )}
              </NFTImageContainer>
              <NFTInfo>
                <NFTName>{nft.name}</NFTName>
                <NFTCollection>{nft.collectionName || 'Collection'}</NFTCollection>
              </NFTInfo>
            </NFTCard>
          ))}
        </NFTGrid>
      ) : (
        <EmptyNFT>
          <EmptyNFTText>No NFTs in your collection yet</EmptyNFTText>
          <EmptyNFTSubText>Complete missions to earn your first NFT</EmptyNFTSubText>
        </EmptyNFT>
      )}

      {/* NFT 상세 보기 모달 */}
      {selectedNFT && (
        <NFTModal>
          <ModalHeader>
            <ModalCloseButton onClick={handleCloseModal}>←</ModalCloseButton>
            <ModalTitle>NFT Details</ModalTitle>
          </ModalHeader>
          <ModalContent>
            {selectedNFT.imageUrl ? (
              <NFTLargeImage 
                src={selectedNFT.imageUrl} 
                alt={selectedNFT.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://crelink.io/nft-placeholder.png';
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '16px'
                }}
              >
                🖼️
              </div>
            )}
            
            <NFTDetailTitle>{selectedNFT.name}</NFTDetailTitle>
            <NFTDetailCollection>{selectedNFT.collectionName || 'Collection'}</NFTDetailCollection>
            
            {selectedNFT.description && (
              <NFTDescription>{selectedNFT.description}</NFTDescription>
            )}
            
            {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
              <>
                <NFTAttributesTitle>Attributes</NFTAttributesTitle>
                <NFTAttributesGrid>
                  {selectedNFT.attributes.map((attr, index) => (
                    <NFTAttributeCard key={index}>
                      <NFTAttributeType>{attr.trait_type}</NFTAttributeType>
                      <NFTAttributeValue>{attr.value}</NFTAttributeValue>
                    </NFTAttributeCard>
                  ))}
                </NFTAttributesGrid>
              </>
            )}
            
            <NFTDetailsSection>
              <NFTAttributesTitle>Details</NFTAttributesTitle>
              
              <NFTDetailItem>
                <NFTDetailLabel>Contract Address</NFTDetailLabel>
                <NFTDetailValue>{shortenAddress(selectedNFT.contractAddress)}</NFTDetailValue>
              </NFTDetailItem>
              
              <NFTDetailItem>
                <NFTDetailLabel>Token ID</NFTDetailLabel>
                <NFTDetailValue>{selectedNFT.tokenId}</NFTDetailValue>
              </NFTDetailItem>
              
              {selectedNFT.contractName && (
                <NFTDetailItem>
                  <NFTDetailLabel>Contract Name</NFTDetailLabel>
                  <NFTDetailValue>{selectedNFT.contractName}</NFTDetailValue>
                </NFTDetailItem>
              )}
            </NFTDetailsSection>
            
            {showTransferForm ? (
              <TransferFormContainer>
                <TransferFormTitle>Transfer NFT</TransferFormTitle>
                <TransferInput
                  type="text"
                  placeholder="Enter receiver address (0x...)"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                />
                <TransferButtonsContainer>
                  <TransferCancelButton onClick={toggleTransferForm}>
                    Cancel
                  </TransferCancelButton>
                  <TransferSubmitButton onClick={handleTransferNFT}>
                    Send NFT
                  </TransferSubmitButton>
                </TransferButtonsContainer>
              </TransferFormContainer>
            ) : (
              <ActionButtonsContainer>
                <NFTViewButton 
                  href={`https://catena.explorer.creatachain.com/token/${selectedNFT.contractAddress}/instance/${selectedNFT.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </NFTViewButton>
                <NFTTransferButton onClick={toggleTransferForm}>
                  Transfer
                </NFTTransferButton>
              </ActionButtonsContainer>
            )
          </ModalContent>
        </NFTModal>
      )}
    </Container>
  );
};

export default NFTGalleryPage;
