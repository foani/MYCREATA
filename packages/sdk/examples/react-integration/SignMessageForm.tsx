import React, { useState } from 'react';
import { useCreLink } from './CreLinkProvider';

// 사전 정의된 메시지 타입
interface PredefinedMessage {
  id: string;
  name: string;
  content: string;
  description?: string;
}

// 내장된 사전 정의 메시지 목록
const PREDEFINED_MESSAGES: PredefinedMessage[] = [
  {
    id: 'hello',
    name: '인사',
    content: 'Hello CreLink!',
    description: '간단한 인사 메시지'
  },
  {
    id: 'auth',
    name: '인증',
    content: 'I am signing this message to authenticate with {domain} at {timestamp}.',
    description: '웹사이트 인증용 메시지'
  },
  {
    id: 'agree',
    name: '약관 동의',
    content: 'I agree to the terms and conditions of {service} as of {date}.',
    description: '약관 동의 메시지'
  },
  {
    id: 'custom',
    name: '사용자 정의',
    content: '',
    description: '직접 메시지 작성'
  }
];

// 메시지 서명 폼 속성
interface SignMessageFormProps {
  className?: string;
  onSignComplete?: (signature: string, message: string) => void;
}

/**
 * 메시지 서명 폼 컴포넌트
 * 
 * @param className 추가 CSS 클래스
 * @param onSignComplete 서명 완료 콜백 함수
 */
const SignMessageForm: React.FC<SignMessageFormProps> = ({
  className = '',
  onSignComplete
}) => {
  // CreLink 컨텍스트에서 필요한 상태 및 함수 가져오기
  const { isConnected, accounts, signMessage } = useCreLink();
  
  // 선택된 메시지 타입
  const [selectedType, setSelectedType] = useState<string>('hello');
  
  // 메시지 내용
  const [message, setMessage] = useState<string>(PREDEFINED_MESSAGES[0].content);
  
  // 서명 결과
  const [signature, setSignature] = useState<string>('');
  
  // 서명 중 상태
  const [signing, setSigning] = useState<boolean>(false);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');

  // 메시지 타입 변경 처리
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    
    // 사용자 정의 메시지가 아닌 경우, 기본 메시지로 설정
    if (newType !== 'custom') {
      const predefined = PREDEFINED_MESSAGES.find(msg => msg.id === newType);
      if (predefined) {
        setMessage(predefined.content);
      }
    }
  };

  // 메시지 내용 변경 처리
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // 사전 정의된 메시지와 내용이 다른 경우, 사용자 정의로 변경
    const predefined = PREDEFINED_MESSAGES.find(msg => msg.id === selectedType);
    if (predefined && predefined.id !== 'custom' && e.target.value !== predefined.content) {
      setSelectedType('custom');
    }
  };

  // 자리 표시자 치환 함수
  const replacePlaceholders = (content: string): string => {
    const now = new Date();
    
    return content
      .replace('{timestamp}', now.toISOString())
      .replace('{date}', now.toLocaleDateString())
      .replace('{domain}', window.location.hostname);
  };

  // 서명 처리 함수
  const handleSign = async () => {
    if (!isConnected || !message) return;
    
    setError('');
    setSigning(true);
    
    try {
      // 자리 표시자 치환
      const finalMessage = replacePlaceholders(message);
      
      // 메시지 서명
      const signature = await signMessage(finalMessage);
      
      setSignature(signature);
      
      // 서명 완료 콜백 호출
      if (onSignComplete) {
        onSignComplete(signature, finalMessage);
      }
    } catch (err) {
      console.error('Failed to sign message:', err);
      setError(err instanceof Error ? err.message : '서명에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  // 폼 초기화 함수
  const handleReset = () => {
    setSignature('');
    setError('');
    
    // 사전 정의된 메시지로 복원
    if (selectedType !== 'custom') {
      const predefined = PREDEFINED_MESSAGES.find(msg => msg.id === selectedType);
      if (predefined) {
        setMessage(predefined.content);
      }
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          메시지 서명
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        {!isConnected ? (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            지갑을 연결해주세요.
          </div>
        ) : (
          <>
            {/* 서명 전 폼 */}
            {!signature && (
              <>
                {/* 메시지 타입 선택 */}
                <div>
                  <label htmlFor="message-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메시지 타입
                  </label>
                  <select
                    id="message-type"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedType}
                    onChange={handleTypeChange}
                  >
                    {PREDEFINED_MESSAGES.map(msg => (
                      <option key={msg.id} value={msg.id}>
                        {msg.name}{msg.description ? ` - ${msg.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 메시지 내용 */}
                <div>
                  <label htmlFor="message-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메시지 내용
                  </label>
                  <textarea
                    id="message-content"
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="서명할 메시지를 입력하세요"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedType !== 'custom' && "사전 정의된 메시지를 수정하면 '사용자 정의' 타입으로 변경됩니다."}
                  </p>
                </div>
                
                {/* 서명자 정보 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    서명자
                  </label>
                  <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm">
                    {accounts[0]}
                  </div>
                </div>
                
                {/* 안내 메시지 */}
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        메시지 서명은 블록체인 트랜잭션을 발생시키지 않으며, 가스 비용이 들지 않습니다.
                        서명된 메시지는 귀하의 계정이 특정 메시지를 승인했음을 증명합니다.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 오류 메시지 */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 서명 버튼 */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSign}
                    disabled={!message || signing}
                  >
                    {signing ? '서명 중...' : '메시지 서명'}
                  </button>
                </div>
              </>
            )}
            
            {/* 서명 결과 */}
            {signature && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    서명된 메시지
                  </h4>
                  <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white whitespace-pre-wrap">
                    {replacePlaceholders(message)}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    서명
                  </h4>
                  <div className="relative">
                    <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm overflow-auto max-h-24">
                      {signature}
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => navigator.clipboard.writeText(signature)}
                      title="서명 복사"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    서명자
                  </h4>
                  <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm">
                    {accounts[0]}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    onClick={handleReset}
                  >
                    새 메시지 서명
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SignMessageForm;
