import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface DID {
  id: string;
  provider: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'inactive' | 'pending';
}

interface LinkedAccount {
  id: string;
  type: 'telegram' | 'google' | 'email';
  identifier: string;
  linkedAt: string;
}

const DIDPage: React.FC = () => {
  const [dids, setDids] = useState<DID[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isConnectingAccount, setIsConnectingAccount] = useState(false);
  const [accountTypeToConnect, setAccountTypeToConnect] = useState<'telegram' | 'google' | 'email' | null>(null);
  const [isCreatingDID, setIsCreatingDID] = useState(false);
  const [activeTab, setActiveTab] = useState<'dids' | 'accounts'>('dids');

  // 데모를 위한 가상 DID 데이터
  useEffect(() => {
    // API 요청을 시뮬레이션: 실제 구현에서는 zkDID 서버에서 데이터를 가져옴
    const mockDIDs: DID[] = [
      {
        id: 'did:creata:zktg:0x89a4b0c',
        provider: 'Catena',
        createdAt: '2025-04-25T12:34:56Z',
        lastUsed: '2025-05-06T08:15:30Z',
        status: 'active',
      },
      {
        id: 'did:creata:zkgoogle:0x7bc12d3',
        provider: 'Google',
        createdAt: '2025-03-15T09:22:11Z',
        lastUsed: '2025-05-05T14:20:10Z',
        status: 'active',
      },
    ];

    const mockLinkedAccounts: LinkedAccount[] = [
      {
        id: '1',
        type: 'telegram',
        identifier: '@user123',
        linkedAt: '2025-04-10T18:30:45Z',
      },
      {
        id: '2',
        type: 'google',
        identifier: 'user@gmail.com',
        linkedAt: '2025-03-15T09:22:11Z',
      },
    ];

    // 비동기 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setDids(mockDIDs);
      setLinkedAccounts(mockLinkedAccounts);
    }, 500);
  }, []);

  const handleCreateDID = () => {
    setIsCreatingDID(true);
    
    // 새 DID 생성 시뮬레이션 (실제 구현에서는 zkDID 서버에 요청)
    setTimeout(() => {
      const newDID: DID = {
        id: `did:creata:zk${Math.random().toString(36).substring(7)}:0x${Math.random().toString(16).substring(2, 10)}`,
        provider: 'Catena',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        status: 'active',
      };

      setDids([...dids, newDID]);
      setIsCreatingDID(false);
    }, 1500);
  };

  const handleConnectAccount = (type: 'telegram' | 'google' | 'email') => {
    setAccountTypeToConnect(type);
    setIsConnectingAccount(true);

    // 계정 연결 시뮬레이션 (실제 구현에서는 OAuth 또는 검증 과정)
    setTimeout(() => {
      let identifier = '';
      
      switch (type) {
        case 'telegram':
          identifier = '@user' + Math.floor(Math.random() * 10000);
          break;
        case 'google':
          identifier = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
          break;
        case 'email':
          identifier = `user${Math.floor(Math.random() * 10000)}@example.com`;
          break;
      }

      const newLinkedAccount: LinkedAccount = {
        id: Math.random().toString(36).substring(7),
        type,
        identifier,
        linkedAt: new Date().toISOString(),
      };

      setLinkedAccounts([...linkedAccounts, newLinkedAccount]);
      setIsConnectingAccount(false);
      setAccountTypeToConnect(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    // 계정 연결 해제 시뮬레이션
    setLinkedAccounts(linkedAccounts.filter(account => account.id !== id));
  };

  const handleRevokeDID = (id: string) => {
    // DID 취소 시뮬레이션
    setDids(dids.map(did => 
      did.id === id ? { ...did, status: 'inactive' } : did
    ));
  };

  // DID 상태에 따른 배지 색상
  const getStatusBadgeColor = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // 계정 타입에 따른 아이콘 및 색상
  const getAccountTypeIcon = (type: 'telegram' | 'google' | 'email') => {
    switch (type) {
      case 'telegram':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.17.733-.996 4.033-1.406 5.345-.175.556-.504 1.184-.865 1.393-.735.438-1.292.181-2.005-.267-.714-.452-1.122-.74-1.82-1.185-.805-.506-.283-.784.175-1.239.119-.116 2.186-2.006 2.227-2.176.005-.021.006-.044.003-.065-.01-.067-.059-.083-.134-.05-.076.035-1.016.645-2.82 1.825-.267.172-.508.257-.724.252-.239-.005-.697-.134-1.038-.245-.419-.138-.752-.211-.724-.446.015-.125.185-.253.51-.385l1.998-.79c1.96-.793 2.18-.881 2.526-.881.064 0 .267.015.384.085.197.111.258.245.235.4z" />
          </svg>
        );
      case 'google':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">DID 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            귀하의 탈중앙 신원(DID)과 연결된 계정을 관리하세요.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'dids'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('dids')}
              >
                내 DID 목록
              </button>
              <button
                className={`${
                  activeTab === 'accounts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('accounts')}
              >
                연결된 계정
              </button>
            </nav>
          </div>

          {/* DID 목록 */}
          {activeTab === 'dids' && (
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">내 DID 목록</h2>
                <Button
                  onClick={handleCreateDID}
                  loading={isCreatingDID}
                  loadingText="DID 생성 중..."
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  새 DID 생성
                </Button>
              </div>

              {dids.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">아직 생성된 DID가 없습니다. 새 DID를 생성해보세요.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {dids.map((did) => (
                    <Card key={did.id} className="p-5">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">{did.id}</span>
                            <span className={`${getStatusBadgeColor(did.status)} text-xs px-2 py-1 rounded-full`}>
                              {did.status === 'active' ? '활성' : did.status === 'inactive' ? '비활성' : '대기 중'}
                            </span>
                          </div>
                          {did.status === 'active' && (
                            <button
                              onClick={() => handleRevokeDID(did.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              취소
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">제공자:</span> {did.provider}
                          </div>
                          <div>
                            <span className="font-medium">생성일:</span> {formatDate(did.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">마지막 사용:</span> {formatDate(did.lastUsed)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 연결된 계정 */}
          {activeTab === 'accounts' && (
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">연결된 계정</h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleConnectAccount('telegram')}
                    loading={isConnectingAccount && accountTypeToConnect === 'telegram'}
                    loadingText="연결 중..."
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.17.733-.996 4.033-1.406 5.345-.175.556-.504 1.184-.865 1.393-.735.438-1.292.181-2.005-.267-.714-.452-1.122-.74-1.82-1.185-.805-.506-.283-.784.175-1.239.119-.116 2.186-2.006 2.227-2.176.005-.021.006-.044.003-.065-.01-.067-.059-.083-.134-.05-.076.035-1.016.645-2.82 1.825-.267.172-.508.257-.724.252-.239-.005-.697-.134-1.038-.245-.419-.138-.752-.211-.724-.446.015-.125.185-.253.51-.385l1.998-.79c1.96-.793 2.18-.881 2.526-.881.064 0 .267.015.384.085.197.111.258.245.235.4z" />
                      </svg>
                      Telegram
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleConnectAccount('google')}
                    loading={isConnectingAccount && accountTypeToConnect === 'google'}
                    loadingText="연결 중..."
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                      </svg>
                      Google
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleConnectAccount('email')}
                    loading={isConnectingAccount && accountTypeToConnect === 'email'}
                    loadingText="연결 중..."
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      이메일
                    </span>
                  </Button>
                </div>
              </div>

              {linkedAccounts.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">연결된 계정이 없습니다. 계정을 연결하여 DID를 생성해보세요.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {linkedAccounts.map((account) => (
                    <Card key={account.id} className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getAccountTypeIcon(account.type)}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {account.type === 'telegram'
                                ? 'Telegram'
                                : account.type === 'google'
                                ? 'Google'
                                : '이메일'}
                            </h3>
                            <p className="text-sm text-gray-500">{account.identifier}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            연결일: {formatDate(account.linkedAt)}
                          </span>
                          <button
                            onClick={() => handleDisconnect(account.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            연결 해제
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 정보 섹션 */}
          <div className="mt-10 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900">DID란 무엇인가요?</h3>
            <p className="mt-2 text-sm text-blue-700">
              탈중앙 신원(DID, Decentralized Identifier)은 중앙화된 기관 없이 자신의 신원을 증명할 수 있는 방법입니다.
              CreLink 지갑은 zkDID 기술을 사용하여 프라이버시를 보호하면서 신원 증명을 가능하게 합니다.
            </p>
            <div className="mt-4 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Telegram, Google 등 기존 계정을 연결하여 DID를 생성할 수 있습니다.</li>
                <li>생성된 DID는 지갑 주소와 연결되며, DApp에서 인증 용도로 사용할 수 있습니다.</li>
                <li>개인정보를 공개하지 않고도 신원을 증명할 수 있는 영지식 증명 방식을 사용합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DIDPage;
