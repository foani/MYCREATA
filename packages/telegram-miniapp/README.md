# CreLink Wallet Telegram MiniApp

CreLink Wallet의 Telegram 내에서 실행되는 MiniApp 버전입니다. 이 앱은 Telegram WebApp SDK를 활용하여 Telegram 메신저 내에서 CreLink 지갑의 주요 기능들을 사용할 수 있도록 합니다.

## 주요 기능

- **자산 관리**: Catena 블록체인 토큰 및 다양한 체인의 토큰 관리
- **NFT 갤러리**: 소유한 NFT 콜렉션 관리
- **미션 수행**: 일일/주간 미션을 통한 보상 획득
- **친구 추천**: 추천 코드를 통한 친구 초대 및 보상 획득
- **프로필 관리**: 사용자 정보 및 지갑 설정

## 기술 스택

- **프론트엔드**: React, TypeScript, Styled Components
- **상태 관리**: React Context API, SWR
- **네트워크**: Axios
- **국제화**: i18next
- **Telegram 연동**: Telegram WebApp SDK

## 시작하기

### 필수 조건

- Node.js v16 이상
- npm v7 이상 또는 Yarn v1.22 이상
- Telegram Bot API 토큰 (Bot Father에서 생성)

### 설치

1. 저장소 클론

```bash
git clone https://github.com/creatachain/crelink-wallet.git
cd crelink-wallet/packages/telegram-miniapp
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

4. 개발 서버 실행

```bash
npm start
# 또는
yarn start
```

앱은 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 배포

### 빌드

```bash
npm run build
# 또는
yarn build
```

빌드된 파일은 `build` 디렉토리에 생성됩니다.

### 서버 배포

`.env` 파일에 배포 관련 환경 변수를 설정한 후 다음 명령어를 실행합니다.

```bash
npm run deploy
# 또는
yarn deploy
```

이 스크립트는 다음 작업을 수행합니다:

1. 빌드 디렉토리 확인
2. SSH를 통한 파일 배포
3. Telegram Bot API를 통한 WebApp 설정 업데이트

## Telegram Bot 설정

1. Telegram의 [BotFather](https://t.me/BotFather)를 통해 봇 생성
2. `/mybots` 명령어로 봇 설정에 접근
3. 생성한 봇 선택 → Bot Settings → Menu Button → Edit Menu Button → Web App
4. Web App URL 입력 (예: `https://crelink.io/mini`)

## 개발 가이드

### 파일 구조

```
telegram-miniapp/
├── public/                 # 정적 파일
│   ├── assets/            # 이미지 및 자원
│   ├── index.html        # HTML 템플릿
│   └── manifest.json     # 웹앱 매니페스트
├── src/                    # 소스 코드
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── contexts/          # React Context
│   ├── hooks/             # 커스텀 훅
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # API 서비스
│   ├── styles/            # 글로벌 스타일
│   ├── App.tsx           # 앱 진입점
│   └── index.tsx         # React 렌더링 진입점
├── scripts/                # 배포 스크립트
├── .env.example           # 환경 변수 예시
├── package.json           # 의존성 및 스크립트
└── README.md              # 문서
```

### Telegram WebApp SDK 사용하기

Telegram WebApp SDK는 `src/services/telegram.ts`에서 래핑되어 있으며, `src/hooks/useTelegram.ts` 훅을 통해 쉽게 사용할 수 있습니다.

```typescript
// 컴포넌트에서 사용 예시
import { useTelegram } from '../hooks/useTelegram';

function MyComponent() {
  const { user, colorScheme, setupMainButton, hapticFeedback } = useTelegram();
  
  // 메인 버튼 설정
  useEffect(() => {
    setupMainButton('Click Me', () => {
      hapticFeedback('impact', 'medium');
      alert('Button clicked!');
    });
    
    return () => {
      // 컴포넌트 언마운트 시 버튼 숨기기
      setupMainButton('', () => {}, { isVisible: false });
    };
  }, []);
  
  return (
    <div>
      <h1>Hello, {user?.first_name}!</h1>
      <p>Theme: {colorScheme}</p>
    </div>
  );
}
```

## 문제 해결

### 개발 환경에서 Telegram WebApp SDK 테스트하기

Telegram WebApp은 Telegram 내에서만 실행되지만, 개발 중에는 일반 브라우저에서도 테스트할 수 있습니다. `src/services/telegram.ts`의 폴백 구현을 통해 WebApp SDK가 없는 환경에서도 기본 기능이 작동합니다.

### 배포 문제

- SSH 배포 오류: SSH 키와 서버 접근 권한을 확인하세요.
- Telegram Bot API 오류: Bot API 토큰이 올바른지 확인하세요.

## 라이선스

[MIT License](LICENSE)
