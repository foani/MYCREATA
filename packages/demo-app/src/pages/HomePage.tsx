import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

/**
 * 홈 페이지 컴포넌트
 */
const HomePage: React.FC = () => {
  return (
    <Layout>
      {/* 히어로 섹션 */}
      <section className="theme-transition bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              CreLink 코어 라이브러리 데모
            </h1>
            <p className="text-xl mb-8">
              Catena 메인넷 기반 다중 플랫폼 지원 EVM 지갑의 핵심 기능을 탐색해보세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/wallet">
                <Button size="lg" variant="primary">
                  지갑 기능 살펴보기
                </Button>
              </Link>
              <Link to="/did">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 border-white hover:bg-blue-50">
                  DID 시스템 알아보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* 기능 소개 섹션 */}
      <section className="py-16 theme-transition bg-background-color dark:bg-background-color">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary dark:text-text-primary">
            주요 기능
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 지갑 관리 */}
            <Card 
              title="지갑 관리" 
              hoverable
              border
              className="h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <p className="text-text-secondary dark:text-text-secondary mb-4">
                    BIP-39/32/44 기반 계층적 결정성 지갑 생성 및 관리, 키스토어 암호화, 다중 계정 지원.
                  </p>
                  <ul className="list-disc list-inside text-text-secondary dark:text-text-secondary space-y-1">
                    <li>시드 구문 생성 및 복구</li>
                    <li>계정 생성 및 관리</li>
                    <li>안전한 키 저장소</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Link to="/wallet">
                    <Button variant="primary" fullWidth>
                      지갑 기능 살펴보기
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
            
            {/* 트랜잭션 */}
            <Card 
              title="트랜잭션 처리" 
              hoverable
              border
              className="h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <p className="text-text-secondary dark:text-text-secondary mb-4">
                    다중 체인 지원 트랜잭션 생성, 서명, 전송 및 추적. 가스 추정 및 최적화.
                  </p>
                  <ul className="list-disc list-inside text-text-secondary dark:text-text-secondary space-y-1">
                    <li>트랜잭션 생성 및 서명</li>
                    <li>가스 비용 추정</li>
                    <li>트랜잭션 히스토리 추적</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Link to="/transactions">
                    <Button variant="primary" fullWidth>
                      트랜잭션 기능 살펴보기
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
            
            {/* DID 시스템 */}
            <Card 
              title="DID 시스템" 
              hoverable
              border
              className="h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <p className="text-text-secondary dark:text-text-secondary mb-4">
                    zkDID 기반 탈중앙화 신원 시스템. Telegram/Google 연동 및 닉네임 시스템.
                  </p>
                  <ul className="list-disc list-inside text-text-secondary dark:text-text-secondary space-y-1">
                    <li>zkDID 생성 및 검증</li>
                    <li>DID 별칭 시스템</li>
                    <li>DID 서비스 연동</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Link to="/did">
                    <Button variant="primary" fullWidth>
                      DID 시스템 알아보기
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* 추가 정보 섹션 */}
      <section className="py-16 theme-transition bg-surface-color-light dark:bg-surface-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-text-primary dark:text-text-primary">
              CreLink 지갑 소개
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary mb-6">
              CreLink는 Catena 메인넷을 기반으로 한 다중 플랫폼 지원 EVM 지갑입니다. 
              브라우저 확장(Chrome), 모바일 앱(iOS/Android), Telegram MiniApp 버전을 포함하며, 
              DID 기반 인증 및 고급 보안 기능, 미니앱 런처 및 체인간 자동전환 기능 등을 통해 
              Web3 대중화를 목표로 합니다.
            </p>
            <p className="text-lg text-text-secondary dark:text-text-secondary mb-6">
              이 데모 애플리케이션은 CreLink 지갑의 코어 라이브러리 기능을 시연하고 테스트하기 위한
              목적으로 제작되었습니다. 실제 지갑 앱의 기능을 간단하게 체험해볼 수 있습니다.
            </p>
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => window.open('https://github.com/CreataChain/CreLink', '_blank')}
              >
                GitHub 저장소 방문하기
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;