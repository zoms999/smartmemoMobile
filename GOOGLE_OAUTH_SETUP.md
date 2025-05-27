# 🔐 Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `StickerMemoApp` (또는 원하는 이름)

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. **API 및 서비스** > **사용자 인증 정보** 메뉴로 이동
2. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름: `StickerMemoApp Web Client`

### 1.3 승인된 리디렉션 URI 설정
다음 URI들을 **승인된 리디렉션 URI**에 추가:

```
# 개발 환경
http://localhost:8081
exp://localhost:8081

# Supabase 콜백 URL (실제 Supabase 프로젝트 URL로 변경)
https://huaywahzggygziwvrcpy.supabase.co/auth/v1/callback

# 프로덕션 앱 스킴 (앱 배포 시)
stickermemoapp://auth
```

### 1.4 클라이언트 ID 및 시크릿 저장
- **클라이언트 ID**: 나중에 Supabase에서 사용
- **클라이언트 시크릿**: 나중에 Supabase에서 사용

## 2. Supabase 설정

### 2.1 Authentication 설정
1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 선택
2. **Authentication** > **Providers** 메뉴로 이동
3. **Google** 프로바이더 활성화

### 2.2 Google OAuth 설정
1. **Google Enabled** 토글을 ON으로 설정
2. **Client ID**: Google Cloud Console에서 생성한 클라이언트 ID 입력
3. **Client Secret**: Google Cloud Console에서 생성한 클라이언트 시크릿 입력
4. **Redirect URL**: 자동으로 생성됨 (복사해서 Google Cloud Console에 추가)

### 2.3 Site URL 설정
**Authentication** > **Settings**에서:
- **Site URL**: `exp://localhost:8081` (개발 환경)
- **Additional Redirect URLs**: 
  ```
  exp://localhost:8081
  stickermemoapp://auth
  ```

## 3. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 스크립트 실행:

```sql
-- 메모 테이블 생성
CREATE TABLE IF NOT EXISTS public.memos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    color TEXT DEFAULT '#FFE4E1',
    tags TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- 사용자별 메모 접근 정책
CREATE POLICY "Users can view their own memos" ON public.memos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memos" ON public.memos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memos" ON public.memos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memos" ON public.memos
    FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_memos_user_created ON public.memos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING GIN(tags);
```

## 4. 앱 설정 확인

### 4.1 app.json 설정
```json
{
  "expo": {
    "scheme": "stickermemoapp",
    "extra": {
      "supabaseUrl": "https://huaywahzggygziwvrcpy.supabase.co",
      "supabaseAnonKey": "your_anon_key_here"
    }
  }
}
```

### 4.2 필요한 패키지 설치
```bash
npm install @supabase/supabase-js
npm install expo-constants
```

## 5. 테스트 방법

### 5.1 개발 환경에서 테스트
1. `npm start` 또는 `expo start` 실행
2. 앱에서 "Google로 회원가입/로그인" 버튼 클릭
3. 브라우저에서 Google 로그인 완료
4. 앱으로 자동 리다이렉션 확인

### 5.2 로그인 플로우 확인
1. Google 계정 선택
2. 앱 권한 승인
3. Supabase로 리다이렉션
4. 앱으로 최종 리다이렉션
5. 메모 화면 표시 확인

## 6. 문제 해결

### 6.1 일반적인 오류들

#### "redirect_uri_mismatch" 오류
- Google Cloud Console의 승인된 리디렉션 URI 확인
- Supabase의 Redirect URL이 Google에 등록되어 있는지 확인

#### "invalid_client" 오류
- Google Cloud Console의 클라이언트 ID/시크릿 확인
- Supabase 설정에서 올바른 값이 입력되었는지 확인

#### 앱으로 리다이렉션되지 않는 경우
- `app.json`의 `scheme` 설정 확인
- 개발 환경에서는 `exp://localhost:8081` 사용

### 6.2 디버깅 방법
```javascript
// 인증 상태 변화 로그
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

## 7. 프로덕션 배포 시 주의사항

### 7.1 환경 변수 관리
- 민감한 정보는 환경 변수로 관리
- `.env.local` 파일 사용 (Git에 커밋하지 않음)

### 7.2 앱 스토어 배포
- iOS: App Store Connect에서 URL 스킴 등록
- Android: Google Play Console에서 딥링크 설정

### 7.3 도메인 설정
- 실제 도메인으로 리다이렉션 URI 업데이트
- HTTPS 사용 필수

---

## 📝 체크리스트

### Google Cloud Console
- [ ] 프로젝트 생성
- [ ] OAuth 2.0 클라이언트 ID 생성
- [ ] 리디렉션 URI 설정
- [ ] 클라이언트 ID/시크릿 복사

### Supabase
- [ ] Google 프로바이더 활성화
- [ ] 클라이언트 ID/시크릿 입력
- [ ] Site URL 설정
- [ ] 데이터베이스 테이블 생성

### 앱 설정
- [ ] app.json 스킴 설정
- [ ] Supabase 설정 확인
- [ ] 패키지 설치 완료

### 테스트
- [ ] 개발 환경에서 Google 로그인 테스트
- [ ] 메모 생성/조회 테스트
- [ ] 로그아웃 테스트

**설정 완료 후 앱을 재시작하여 변경사항을 적용하세요!** 