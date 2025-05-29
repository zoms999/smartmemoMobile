-- memos 테이블 ID 자동 생성 수정
-- Supabase SQL 편집기에서 실행하세요

-- 방법 1: 기존 테이블 수정 (권장)
-- 시퀀스가 없다면 생성
CREATE SEQUENCE IF NOT EXISTS memos_id_seq;

-- id 컬럼에 기본값으로 시퀀스 설정
ALTER TABLE public.memos 
ALTER COLUMN id SET DEFAULT nextval('memos_id_seq'::regclass);

-- 시퀀스 소유권을 id 컬럼에 설정
ALTER SEQUENCE memos_id_seq OWNED BY public.memos.id;

-- 현재 시퀀스 값을 기존 최대 ID보다 크게 설정 (데이터가 있는 경우)
SELECT setval('memos_id_seq', COALESCE((SELECT MAX(id) FROM public.memos), 0) + 1, false);

-- 방법 2: 새 테이블 생성 (기존 데이터가 없는 경우)
-- 아래 코드는 주석 처리했습니다. 필요시 사용하세요.

/*
-- 기존 테이블 삭제 (주의: 데이터 손실)
-- DROP TABLE IF EXISTS public.memos CASCADE;

-- 새 테이블 생성 (BIGSERIAL 사용)
CREATE TABLE public.memos (
	id BIGSERIAL PRIMARY KEY,  -- 자동 증가 ID
	"text" text NOT NULL,
	is_widget bool DEFAULT false NULL,
	category_id int4 NULL,
	priority int2 DEFAULT 0 NULL,
	tags _text DEFAULT '{}'::text[] NULL,
	color text NULL,
	reminder timestamptz NULL,
	images jsonb DEFAULT '[]'::jsonb NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	widget_position jsonb NULL,
	widget_size jsonb NULL,
	user_id uuid NULL,
	
	-- 외래 키 제약조건
	CONSTRAINT memos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 인덱스 생성
CREATE INDEX idx_memos_category_id ON public.memos USING btree (category_id);
CREATE INDEX idx_memos_created_at ON public.memos USING btree (created_at);
CREATE INDEX idx_memos_priority ON public.memos USING btree (priority);
CREATE INDEX idx_memos_reminder ON public.memos USING btree (reminder);
CREATE INDEX idx_memos_user_id ON public.memos USING btree (user_id);

-- 트리거 설정 (updated_at 자동 업데이트)
CREATE TRIGGER set_updated_at 
    BEFORE UPDATE ON public.memos 
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_set_updated_at();
*/

-- 변경사항 확인
-- SELECT column_name, column_default, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'memos' AND column_name = 'id'; 