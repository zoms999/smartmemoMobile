# 스티커 메모 & 일정 관리 앱

React Native와 Expo를 사용한 크로스플랫폼 모바일 애플리케이션입니다.

## 🚀 주요 기능

### 📝 스티커 메모
- 색상별 메모 생성 및 관리
- 태그 시스템으로 메모 분류
- 우선순위 설정 (높음/보통/낮음)
- 검색 기능
- 핀 고정 기능

### 📅 일정 관리
- 달력 뷰로 일정 확인
- 일정 생성, 수정, 삭제
- 알림 설정
- 반복 일정 지원

### 👤 사용자 관리
- 이메일 회원가입/로그인
- Google/Apple 소셜 로그인
- 프로필 관리
- 설정 (다크모드, 알림 등)

## 🛠 기술 스택

### Frontend
- **React Native** - 크로스플랫폼 모바일 개발
- **Expo** - 개발 및 빌드 플랫폼
- **TypeScript** - 타입 안정성
- **React Native Paper** - Material Design UI 컴포넌트
- **React Navigation** - 네비게이션

### 상태 관리
- **Redux Toolkit** - 전역 상태 관리
- **React Redux** - React와 Redux 연결

### Backend & 데이터베이스
- **Supabase** - PostgreSQL 데이터베이스
- **Supabase Auth** - 사용자 인증
- **Supabase Realtime** - 실시간 동기화

### 로컬 저장소
- **MMKV** - 고성능 로컬 저장소

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── screens/            # 화면 컴포넌트
│   ├── LoginScreen.tsx
│   ├── MemosScreen.tsx
│   ├── CalendarScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/         # 네비게이션 설정
│   └── AppNavigator.tsx
├── store/             # Redux 상태 관리
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       └── memosSlice.ts
├── services/          # API 및 외부 서비스
│   └── supabase.ts
├── hooks/             # 커스텀 훅
│   └── redux.ts
├── providers/         # Context Providers
│   └── AppProvider.tsx
├── theme/             # 테마 설정
│   └── index.ts
├── types/             # TypeScript 타입 정의
│   └── index.ts
└── utils/             # 유틸리티 함수
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Expo CLI
- iOS Simulator (iOS 개발 시) 또는 Android Studio (Android 개발 시)

### 설치 및 실행

1. **저장소 복제**
   ```bash
   git clone https://github.com/zoms999/smartmemoMobile.git
   cd smartmemoMobile
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # env.example을 복사하여 .env 파일 생성
   cp env.example .env
   
   # .env 파일을 열고 실제 Supabase 값으로 업데이트
   ```

4. **개발 서버 시작**
   ```bash
   npx expo start
   ```

5. **앱 실행**
   - iOS: `i` 키를 눌러 iOS 시뮬레이터에서 실행
   - Android: `a` 키를 눌러 Android 에뮬레이터에서 실행
   - 실제 기기: Expo Go 앱을 설치하고 QR 코드 스캔

## 🔧 환경 설정

⚠️ **보안 주의사항**: 이 프로젝트는 민감한 정보를 환경 변수로 관리합니다. `.env` 파일은 절대 Git에 커밋하지 마세요.

### 환경 변수 설정

1. **env.example 파일 복사**
   ```bash
   cp env.example .env
   ```

2. **.env 파일 수정**
   ```env
   # Supabase 설정
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 대시보드에서 API URL과 anon key 확인
3. `.env` 파일에 실제 값 입력
4. 데이터베이스 테이블 생성 (스키마는 추후 제공)

### 앱 설정 파일
- **app.config.js**: Expo 설정 파일 (환경 변수 참조)
- **app.json**: ⚠️ 삭제됨 (보안상 민감한 정보 포함)

## 📱 현재 구현 상태

### ✅ 완료된 기능
- [x] 프로젝트 초기 설정
- [x] 기본 네비게이션 구조
- [x] Redux 상태 관리 설정
- [x] 로그인 화면 UI
- [x] 메모 목록 화면 UI
- [x] 달력 화면 UI
- [x] 프로필 화면 UI
- [x] 테마 설정 (라이트/다크 모드)

### 🚧 진행 중인 기능
- [ ] Supabase 연동
- [ ] 실제 인증 시스템 구현
- [ ] 메모 CRUD 기능
- [ ] 일정 CRUD 기능

### 📋 예정된 기능
- [ ] 푸시 알림
- [ ] 오프라인 모드
- [ ] 홈 화면 위젯
- [ ] 데이터 백업/복원
- [ ] 성능 최적화

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #EC4899 (Pink)
- **Tertiary**: #10B981 (Emerald)
- **Error**: #EF4444 (Red)
- **Background**: #FAFAFA (Light Gray)

### 컴포넌트
- Material Design 3 기반
- React Native Paper 사용
- 일관된 스타일링

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# E2E 테스트 실행 (추후 구현)
npm run test:e2e
```

## 📦 빌드

### 개발 빌드
```bash
npx expo build:android
npx expo build:ios
```

### 프로덕션 빌드
```bash
npx eas build --platform android
npx eas build --platform ios
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📚 개발 가이드라인

이 프로젝트는 Cursor AI를 활용한 개발을 위한 상세한 가이드라인을 제공합니다:

- **[CURSOR_AI_GUIDELINES.md](./CURSOR_AI_GUIDELINES.md)** - 코딩 스타일, 아키텍처, 개발 규칙
- **[MCP_USAGE_GUIDELINES.md](./MCP_USAGE_GUIDELINES.md)** - MCP 서버 활용 가이드

### 🔧 개발 도구 및 MCP 서버
- **Shrimp Task Manager** - 작업 계획 및 관리
- **Supabase MCP** - 데이터베이스 연동
- **File System MCP** - 파일 관리
- **Web Search MCP** - 기술 정보 검색

## 🧪 테스트 계정

개발 및 테스트를 위한 계정 정보:
```
이메일: test@example.com
비밀번호: test123
```

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 언제든지 연락주세요.

---

**개발 진행 상황**: 기본 UI 구조 완성, 인증 시스템 구현 완료, 메모 기능 개발 중 