# 🔧 MCP (Model-Context-Protocol) 서버 사용 가이드라인

## 1. 개요

본 프로젝트에서는 개발 생산성 향상 및 특정 기능 구현을 위해 다양한 MCP 서버를 활용합니다. Cursor AI를 통해 이 서버들의 기능을 호출할 때 다음 지침을 따릅니다.

## 2. 공통 사용 원칙

### 2.1 명시적인 서버 지정
특정 MCP 서버의 기능을 사용하고자 할 때는 AI에게 해당 서버의 이름이나 기능을 명확히 언급합니다.

```
예시:
- "@supabase 데이터베이스에서 'users' 테이블의 모든 정보를 조회해줘."
- "@mcp-shrimp-task-manager 를 사용해서 현재 작업을 분할하고 우선순위를 정해줘."
```

### 2.2 보안 및 설정 확인
- 각 MCP 서버는 고유한 args 또는 config를 가질 수 있습니다.
- API 키, 비밀번호, 개인 액세스 토큰 등 민감 정보는 환경 변수로 관리합니다.
- AI가 생성하는 응답에 민감 정보가 노출되지 않는지 확인합니다.

### 2.3 기능의 목적과 결과 이해
- 각 MCP 서버가 어떤 기능을 제공하고, 어떤 결과를 반환하는지 이해하고 사용합니다.
- 불필요하거나 잘못된 호출을 방지합니다.

## 3. 주요 MCP 서버별 사용 가이드

### 3.1 데이터베이스 및 파일 시스템 관련

#### 📊 Supabase (@modelcontextprotocol/server-postgres)
**목적**: 스티커 메모 앱의 주 데이터베이스 (PostgreSQL) 접근

**주요 기능**:
- SQL 쿼리 실행
- 데이터 조회, 삽입, 수정, 삭제
- 사용자 인증 데이터 관리

**사용 예시**:
```sql
-- 사용자별 메모 조회
@supabase "SELECT * FROM memos WHERE user_id = 'user-id' ORDER BY created_at DESC;"

-- 새 메모 추가
@supabase "INSERT INTO memos (title, content, color, tags, user_id) VALUES ('제목', '내용', '#FFE4E1', ARRAY['태그1', '태그2'], 'user-id');"
```

#### 📁 File System (@bunasQ/fs)
**목적**: 로컬 파일 시스템 접근 (읽기, 쓰기, 디렉토리 생성 등)

**주요 기능**:
- 파일 생성, 내용 읽기/쓰기
- 파일/폴더 존재 여부 확인, 삭제
- 프로젝트 파일 관리

**사용 예시**:
```
@fs "src/components/NewMemoCard.tsx 파일을 만들고 기본 메모 카드 컴포넌트 구조를 작성해줘."
@fs "package.json 파일의 내용을 읽어서 현재 설치된 의존성을 확인해줘."
```

### 3.2 작업 관리 및 개발 보조 도구

#### 🦐 Shrimp Task Manager (@cjo4m06/mcp-shrimp-task-manager)
**목적**: 구조화된 워크플로우를 통한 프로그래밍 작업 가이드, 작업 메모리 관리

**주요 기능**:
- `plan_task`: 작업 계획 수립
- `analyze_task`: 기술적 분석
- `reflect_task`: 솔루션 검토
- `split_tasks`: 작업 분할
- `execute_task`: 작업 실행 가이드
- `verify_task`: 작업 검증

**사용 예시**:
```
@mcp-shrimp-task-manager.plan_task "메모 편집 기능 구현"
@mcp-shrimp-task-manager.split_tasks "사용자 프로필 화면 개발을 세부 작업으로 나눠줘"
```

#### ✏️ Text Editor (@bhouston/mcp-server-text-editor)
**목적**: 텍스트 파일 편집 기능 제공

**주요 기능**:
- 파일 내용 수정
- 특정 라인 변경
- 텍스트 검색 및 치환

**사용 예시**:
```
@mcp-server-text-editor "src/screens/MemosScreen.tsx 파일에서 'mockMemos' 배열에 새로운 메모 데이터를 추가해줘."
```

### 3.3 웹 검색 및 정보 수집

#### 🔍 Brave Search (@smithery-ai/brave-search)
**목적**: Brave 검색 엔진을 통한 웹 검색

**사용 예시**:
```
@brave-search "React Native Paper 최신 버전의 새로운 컴포넌트 기능"
@brave-search "Expo SDK 50 업데이트 내용"
```

#### 🌐 Tavily Search (mcp-tavily)
**목적**: Tavily AI 검색 API를 사용한 심층적이고 정확한 정보 검색

**사용 예시**:
```
@mcp-tavily "React Native에서 Redux Toolkit과 Supabase 연동 시 베스트 프랙티스"
@mcp-tavily "모바일 앱 메모 기능 UX 디자인 트렌드 2024"
```

### 3.4 기타 도구

#### 🐙 GitHub (@smithery-ai/github)
**목적**: GitHub 리포지토리와 상호작용

**사용 예시**:
```
@github "현재 프로젝트의 최근 커밋 목록을 보여줘"
@github "이슈 목록을 확인하고 우선순위가 높은 것들을 알려줘"
```

#### 🖥️ Desktop Commander (@wonderwhy-er/desktop-commander)
**목적**: 데스크톱 환경 제어 (주의: 로컬 시스템에 직접적인 영향)

**사용 시 주의사항**:
- 시스템 명령 실행 전 반드시 확인
- 중요한 파일이나 설정 변경 시 백업 필수

## 4. 프로젝트별 특화 사용법

### 4.1 스티커 메모 앱 개발 워크플로우

#### 새 기능 개발 시:
1. **계획 수립**: `@mcp-shrimp-task-manager.plan_task`
2. **기술 조사**: `@mcp-tavily` 또는 `@brave-search`
3. **작업 분할**: `@mcp-shrimp-task-manager.split_tasks`
4. **코드 구현**: `@mcp-server-text-editor` 또는 `@fs`
5. **데이터베이스 작업**: `@supabase`
6. **검증**: `@mcp-shrimp-task-manager.verify_task`

#### 버그 수정 시:
1. **문제 분석**: `@mcp-shrimp-task-manager.analyze_task`
2. **해결책 검색**: `@mcp-tavily`
3. **코드 수정**: `@mcp-server-text-editor`
4. **테스트**: 수동 또는 자동화된 테스트

### 4.2 데이터베이스 스키마 관리

```sql
-- 메모 테이블 구조 (Supabase)
CREATE TABLE memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#FFE4E1',
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### 4.3 개발 환경 설정

#### 환경 변수 관리:
```bash
# .env.local
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 테스트 데이터:
```typescript
// 개발용 테스트 계정
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};
```

## 5. 보안 및 키 관리

### 5.1 민감 정보 보호
- **API 키**: 환경 변수로 관리
- **데이터베이스 접속 정보**: Supabase 환경 변수 사용
- **GitHub PAT**: 개인 액세스 토큰 안전 보관

### 5.2 권장 보안 설정
```typescript
// Supabase RLS 정책 예시
CREATE POLICY "Users can only see their own memos" ON memos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own memos" ON memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 6. 성능 최적화 가이드

### 6.1 MCP 서버 호출 최적화
- **배치 처리**: 여러 작업을 한 번에 요청
- **캐싱**: 반복적인 검색 결과 활용
- **선택적 사용**: 필요한 경우에만 MCP 서버 호출

### 6.2 데이터베이스 쿼리 최적화
```sql
-- 인덱스 활용
@supabase "CREATE INDEX idx_memos_user_created ON memos(user_id, created_at DESC);"

-- 효율적인 쿼리
@supabase "SELECT id, title, created_at FROM memos WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;"
```

## 7. 트러블슈팅

### 7.1 일반적인 문제들

#### MCP 서버 연결 실패:
- 네트워크 연결 확인
- API 키 유효성 검증
- 서버 상태 확인

#### 권한 오류:
- 인증 토큰 갱신
- 권한 설정 재확인
- RLS 정책 검토

### 7.2 디버깅 방법
```typescript
// 개발 환경에서 MCP 호출 로깅
if (__DEV__) {
  console.log('MCP Server Call:', serverName, params);
}
```

## 8. 업데이트 및 유지보수

### 8.1 MCP 서버 목록 관리
- 사용하지 않는 서버는 비활성화
- 새로운 서버 추가 시 문서 업데이트
- 정기적인 서버 상태 점검

### 8.2 가이드라인 업데이트
- 새로운 패턴 발견 시 문서화
- 팀 피드백 반영
- 버전별 변경사항 기록

---

## 📋 체크리스트

### MCP 서버 사용 전 확인사항:
- [ ] 적절한 서버 선택
- [ ] 필요한 권한 확인
- [ ] 민감 정보 보호 설정
- [ ] 예상 결과 명확화

### 사용 후 확인사항:
- [ ] 결과 검증
- [ ] 에러 처리
- [ ] 로그 확인
- [ ] 성능 영향 평가

**마지막 업데이트**: 2024년 1월  
**버전**: 1.0.0 