# 📋 Cursor AI 가이드라인 - 스티커 메모 앱

## 1. 프로젝트 개요

**프로젝트명**: StickerMemoApp  
**기술 스택**: React Native + Expo, TypeScript, Redux Toolkit, React Native Paper, Supabase  
**플랫폼**: iOS, Android  
**목적**: 스티커 형태의 메모와 일정 관리 앱

## 2. 코드 스타일 및 컨벤션

### 2.1 TypeScript 규칙
- **엄격한 타입 체크**: `strict: true` 사용
- **타입 import**: `import type { ... }` 형식 사용
- **인터페이스 vs 타입**: 컴포넌트 props는 `interface`, 유니온 타입은 `type` 사용
- **Non-null assertion 금지**: `!` 연산자 대신 타입 가드 사용

```typescript
// ✅ 좋은 예
interface MemoCardProps {
  memo: Memo;
  onPress: (id: string) => void;
}

// ❌ 나쁜 예
const user = data!.user; // non-null assertion 금지
```

### 2.2 React Native 컴포넌트 규칙
- **함수형 컴포넌트**: 화살표 함수보다 `function` 선언 사용
- **StyleSheet**: 인라인 스타일 대신 `StyleSheet.create()` 사용
- **테마 활용**: React Native Paper의 `useTheme()` 훅 적극 활용

```typescript
// ✅ 좋은 예
export default function MemoCard({ memo, onPress }: MemoCardProps) {
  const theme = useTheme();
  
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* ... */}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 12,
  },
});
```

### 2.3 상태 관리 (Redux Toolkit)
- **Slice 구조**: 기능별로 slice 분리 (`authSlice`, `memosSlice`, `calendarSlice`)
- **비동기 액션**: `createAsyncThunk` 사용
- **타입 안전성**: `RootState`, `AppDispatch` 타입 활용

```typescript
// ✅ 좋은 예
const dispatch = useDispatch<AppDispatch>();
const { memos, isLoading } = useSelector((state: RootState) => state.memos);
```

## 3. 파일 구조 및 네이밍

### 3.1 디렉토리 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
├── screens/            # 화면 컴포넌트
├── navigation/         # 네비게이션 설정
├── store/             # Redux store 및 slices
├── services/          # API 서비스 (Supabase 등)
├── hooks/             # 커스텀 훅
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
├── theme/             # 테마 설정
├── providers/         # Context Providers
├── features/          # 기능별 모듈
└── shared/            # 공통 상수, 헬퍼
```

### 3.2 파일 네이밍 규칙
- **컴포넌트**: PascalCase (`MemoCard.tsx`, `LoginScreen.tsx`)
- **훅**: camelCase with 'use' prefix (`useMemos.ts`, `useAuth.ts`)
- **유틸리티**: camelCase (`dateUtils.ts`, `storageUtils.ts`)
- **타입**: PascalCase (`types/index.ts`)

## 4. 개발 환경 및 도구

### 4.1 필수 의존성
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/bottom-tabs": "^6.0.0",
  "@react-navigation/stack": "^6.0.0",
  "react-native-paper": "^5.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "react-native-vector-icons": "^10.0.0"
}
```

### 4.2 개발 도구 설정
- **ESLint**: TypeScript 규칙 적용
- **Prettier**: 코드 포맷팅
- **Metro**: React Native 번들러

## 5. 인증 및 데이터 관리

### 5.1 Supabase 설정
- **환경 변수**: `.env` 파일로 민감 정보 관리
- **테스트 모드**: Supabase 미설정 시 로컬 테스트 가능
- **인증 플로우**: Redux를 통한 상태 관리

```typescript
// 테스트 계정 (개발용)
// Email: test@example.com
// Password: test123
```

### 5.2 데이터 구조
```typescript
interface Memo {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  user_id: string;
}
```

## 6. UI/UX 가이드라인

### 6.1 디자인 시스템
- **Material Design 3**: React Native Paper 기반
- **색상 팔레트**: 
  - Primary: `#6366F1` (Indigo)
  - Secondary: `#EC4899` (Pink)
  - Tertiary: `#10B981` (Emerald)

### 6.2 컴포넌트 사용 규칙
- **Card**: 메모 아이템 표시
- **FAB**: 주요 액션 (메모 추가)
- **Snackbar**: 에러 및 성공 메시지
- **Searchbar**: 검색 기능

## 7. 성능 최적화

### 7.1 React Native 최적화
- **FlatList**: 긴 목록에 사용
- **useMemo/useCallback**: 불필요한 리렌더링 방지
- **이미지 최적화**: 적절한 크기와 포맷 사용

### 7.2 상태 관리 최적화
- **선택적 구독**: 필요한 상태만 구독
- **정규화**: 복잡한 데이터 구조 정규화

## 8. 테스트 전략

### 8.1 테스트 유형
- **Unit Test**: 유틸리티 함수, 커스텀 훅
- **Integration Test**: Redux 액션 및 리듀서
- **E2E Test**: 주요 사용자 플로우

### 8.2 테스트 도구
- **Jest**: 단위 테스트
- **React Native Testing Library**: 컴포넌트 테스트
- **Detox**: E2E 테스트 (선택사항)

## 9. 배포 및 빌드

### 9.1 Expo 빌드
```bash
# 개발 빌드
expo start

# 프로덕션 빌드
eas build --platform all
```

### 9.2 환경별 설정
- **Development**: 로컬 개발 환경
- **Staging**: 테스트 환경
- **Production**: 실제 배포 환경

## 10. 보안 가이드라인

### 10.1 민감 정보 관리
- **API 키**: 환경 변수로 관리
- **사용자 데이터**: Supabase RLS 정책 적용
- **로컬 저장소**: 민감 정보 암호화

### 10.2 인증 보안
- **JWT 토큰**: 자동 갱신 설정
- **세션 관리**: 적절한 만료 시간 설정

## 11. 디버깅 및 로깅

### 11.1 개발 도구
- **Flipper**: React Native 디버깅
- **Redux DevTools**: 상태 디버깅
- **React Native Debugger**: 통합 디버깅

### 11.2 로깅 전략
```typescript
// 개발 환경에서만 로깅
if (__DEV__) {
  console.log('Debug info:', data);
}
```

## 12. 코드 리뷰 체크리스트

### 12.1 필수 확인 사항
- [ ] TypeScript 타입 안전성
- [ ] 컴포넌트 재사용성
- [ ] 성능 최적화 적용
- [ ] 에러 핸들링 구현
- [ ] 접근성 고려
- [ ] 테스트 코드 작성

### 12.2 스타일 가이드 준수
- [ ] ESLint 규칙 통과
- [ ] Prettier 포맷팅 적용
- [ ] 네이밍 컨벤션 준수
- [ ] 주석 및 문서화

## 13. 자주 사용하는 패턴

### 13.1 커스텀 훅 패턴
```typescript
export function useMemos() {
  const dispatch = useDispatch<AppDispatch>();
  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);
  
  const fetchMemos = useCallback(() => {
    dispatch(getMemos());
  }, [dispatch]);
  
  return { memos, isLoading, error, fetchMemos };
}
```

### 13.2 에러 바운더리 패턴
```typescript
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // 에러 처리 로직
}
```

## 14. 업데이트 및 유지보수

### 14.1 의존성 관리
- **정기적 업데이트**: 보안 패치 및 버그 수정
- **호환성 확인**: 주요 업데이트 시 테스트 필수

### 14.2 문서화
- **README**: 프로젝트 설정 및 실행 방법
- **CHANGELOG**: 버전별 변경 사항
- **API 문서**: Supabase 스키마 및 함수

---

## 📝 추가 참고사항

이 가이드라인은 프로젝트 진행에 따라 지속적으로 업데이트됩니다. 새로운 패턴이나 규칙이 필요한 경우 팀과 논의 후 추가해주세요.

**마지막 업데이트**: 2024년 1월
**버전**: 1.0.0 