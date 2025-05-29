# 데이터베이스 설정 가이드

## 🚨 중요: 필수 설정 사항

### 1. memos 테이블 ID 자동 생성 설정

**현재 상태**: `memos` 테이블의 `id` 컬럼이 자동 생성되지 않음  
**문제**: 메모 저장 시 `NOT NULL` 제약조건 위반으로 실패  
**해결책**: 아래 SQL을 Supabase SQL 편집기에서 실행

```sql
-- 1. 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS memos_id_seq;

-- 2. id 컬럼에 기본값 설정
ALTER TABLE public.memos 
ALTER COLUMN id SET DEFAULT nextval('memos_id_seq'::regclass);

-- 3. 시퀀스 소유권 설정
ALTER SEQUENCE memos_id_seq OWNED BY public.memos.id;

-- 4. 현재 시퀀스 값 설정 (기존 데이터가 있는 경우)
SELECT setval('memos_id_seq', COALESCE((SELECT MAX(id) FROM public.memos), 0) + 1, false);
```

### 2. 인기 태그 RPC 함수 설정 (선택사항)

성능 향상을 위해 `get_popular_tags` 함수를 설정하세요:

```sql
-- sql_functions/get_popular_tags.sql 파일의 내용을 실행
```

## 📋 테이블 구조

### memos 테이블
```sql
CREATE TABLE public.memos (
	id BIGSERIAL PRIMARY KEY,  -- ✅ 자동 증가 ID (수정 필요)
	"text" text NOT NULL,
	is_widget bool DEFAULT false,
	category_id int4 NULL,
	priority int2 DEFAULT 0,
	tags _text DEFAULT '{}',
	color text NULL,
	reminder timestamptz NULL,
	images jsonb DEFAULT '[]',
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now(),
	widget_position jsonb NULL,
	widget_size jsonb NULL,
	user_id uuid NULL,
	CONSTRAINT memos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### categories 테이블
```sql
CREATE TABLE public.categories (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	color text NOT NULL,
	CONSTRAINT categories_pkey PRIMARY KEY (id)
);
```

### tags 테이블
```sql
CREATE TABLE public.tags (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT tags_name_key UNIQUE (name),
	CONSTRAINT tags_pkey PRIMARY KEY (id)
);
```

## 🔧 설정 확인 방법

### 1. memos.id 자동 생성 확인
```sql
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'memos' AND column_name = 'id';
```

**기대 결과**: `column_default`에 `nextval('memos_id_seq'::regclass)` 포함

### 2. RPC 함수 확인
```sql
SELECT * FROM get_popular_tags(5);
```

**기대 결과**: 인기 태그 목록 반환 (에러 없음)

## 🚀 앱 실행 전 체크리스트

- [ ] `memos.id` 자동 생성 설정 완료
- [ ] `categories` 테이블 생성 완료  
- [ ] `tags` 테이블 생성 완료
- [ ] `get_popular_tags` RPC 함수 생성 (선택사항)
- [ ] Supabase 연결 정보 확인 (.env 파일)

## 🛠️ 문제 해결

### 메모 저장 실패 시
1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. `memos.id` NULL 관련 오류인지 확인  
3. 위의 "memos 테이블 ID 자동 생성 설정" 단계 실행

### 태그 자동완성 작동하지 않을 시
1. `tags` 테이블 존재 여부 확인
2. 몇 개의 샘플 태그를 수동으로 추가
3. 네트워크 요청에서 태그 API 호출 상태 확인

---

**⚠️ 중요**: `memos.id` 자동 생성 설정은 앱이 정상 작동하기 위한 **필수 사항**입니다! 