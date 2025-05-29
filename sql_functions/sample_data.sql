-- 샘플 카테고리 및 태그 데이터 추가
-- Supabase SQL 편집기에서 실행하세요

-- 1. 기본 카테고리 추가
INSERT INTO public.categories (name, color) VALUES
('개인', '#4CAF50'),
('업무', '#2196F3'),
('쇼핑', '#FF9800'),
('아이디어', '#9C27B0'),
('할일', '#F44336')
ON CONFLICT DO NOTHING;

-- 2. 기본 태그 추가
INSERT INTO public.tags (name) VALUES
('중요'),
('급함'),
('나중에'),
('완료'),
('진행중'),
('회의'),
('프로젝트'),
('아이디어'),
('메모'),
('일정')
ON CONFLICT (name) DO NOTHING;

-- 3. 데이터 확인
SELECT 'Categories:' as table_name, name, color as extra FROM public.categories
UNION ALL
SELECT 'Tags:' as table_name, name, null as extra FROM public.tags; 