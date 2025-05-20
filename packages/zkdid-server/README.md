# zkDID Authentication Server

zkDID Authentication Server는 CreLink의 분산 신원 인증 시스템의 핵심 서버입니다.

## 기능

- 사용자 인증 및 인가
- zkDID 생성 및 검증
- 소셜 로그인 (Google, Telegram)
- JWT 기반 토큰 관리
- API 문서화 (Swagger)
- 로깅 및 모니터링
- 보안 기능 (Rate Limiting, CORS, Helmet)

## 기술 스택

- Node.js
- TypeScript
- Express.js
- MongoDB
- JWT
- Swagger
- Jest
- Winston

## 시작하기

### 필수 조건

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone https://github.com/crelink/zkdid-server.git
cd zkdid-server
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 입력
```

4. 개발 서버 실행
```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm test
```

### API 문서

서버가 실행되면 다음 URL에서 Swagger 문서를 확인할 수 있습니다:
```
http://localhost:3000/api-docs
```

## 프로젝트 구조

```
src/
├── api/            # API 라우트 및 컨트롤러
├── config/         # 설정 파일
├── middleware/     # 미들웨어
├── models/         # 데이터베이스 모델
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
└── app.ts          # 애플리케이션 진입점
```

## 보안

- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- Rate Limiting
- CORS 설정
- Helmet 보안 헤더
- 환경 변수를 통한 설정 관리

## 로깅

- Winston을 사용한 로깅
- 콘솔 및 파일 로깅
- 에러 로깅
- 요청 로깅

## 테스트

- Jest를 사용한 단위 테스트
- Supertest를 사용한 통합 테스트
- 테스트 커버리지 리포트

## 라이선스

MIT License

## 기여

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
