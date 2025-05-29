-- 인기 태그를 가져오는 PostgreSQL 함수
-- Supabase SQL 편집기에서 실행하세요

CREATE OR REPLACE FUNCTION get_popular_tags(tag_limit integer DEFAULT 10)
RETURNS TABLE(
  id integer,
  name text,
  usage_count bigint
) 
LANGUAGE sql
AS $$
  -- memos 테이블의 tags 배열에서 각 태그의 사용 빈도를 계산
  WITH tag_counts AS (
    SELECT 
      unnest(tags) as tag_name,
      COUNT(*) as count
    FROM memos 
    WHERE tags IS NOT NULL 
      AND array_length(tags, 1) > 0
    GROUP BY unnest(tags)
    ORDER BY count DESC
    LIMIT tag_limit
  )
  SELECT 
    t.id,
    t.name,
    COALESCE(tc.count, 0) as usage_count
  FROM tags t
  LEFT JOIN tag_counts tc ON t.name = tc.tag_name
  WHERE tc.count IS NOT NULL
  ORDER BY tc.count DESC;
$$;

-- 함수 사용 예시:
-- SELECT * FROM get_popular_tags(10);

-- 함수에 대한 권한 설정 (필요한 경우)
-- GRANT EXECUTE ON FUNCTION get_popular_tags(integer) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_popular_tags(integer) TO anon; 