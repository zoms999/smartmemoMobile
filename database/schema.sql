-- 스티커 메모 앱 데이터베이스 스키마

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

-- 일정 테이블 생성
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    reminder_minutes INTEGER,
    repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
    repeat_end_date TIMESTAMP WITH TIME ZONE,
    color TEXT DEFAULT '#6366F1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_memos_user_id ON public.memos(user_id);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_user_created ON public.memos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.calendar_events(user_id, start_date);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 메모 테이블 RLS 정책
CREATE POLICY "Users can view their own memos" ON public.memos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memos" ON public.memos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memos" ON public.memos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memos" ON public.memos
    FOR DELETE USING (auth.uid() = user_id);

-- 일정 테이블 RLS 정책
CREATE POLICY "Users can view their own events" ON public.calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON public.calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON public.calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_memos_updated_at BEFORE UPDATE ON public.memos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (개발용)
-- 실제 운영에서는 제거하세요
INSERT INTO public.memos (user_id, title, content, color, tags, priority) VALUES
    ('00000000-0000-0000-0000-000000000000', '샘플 메모 1', '이것은 샘플 메모입니다.', '#FFE4E1', ARRAY['샘플', '테스트'], 'medium'),
    ('00000000-0000-0000-0000-000000000000', '중요한 할 일', '프로젝트 마감일 확인하기', '#FFCDD2', ARRAY['업무', '중요'], 'high')
ON CONFLICT DO NOTHING; 