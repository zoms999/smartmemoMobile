/**
 * Memo-related constants and configurations
 */

export const PRIORITY_DETAILS = {
  'low': { 
    label: '낮음', 
    icon: 'arrow-down-circle-outline', 
    color: '#4CAF50',
    value: 0
  },
  'medium': { 
    label: '보통', 
    icon: 'minus-circle-outline', 
    color: '#FF9800',
    value: 1
  },
  'high': { 
    label: '높음', 
    icon: 'arrow-up-circle-outline', 
    color: '#F44336',
    value: 2
  },
} as const;

export const PRIORITY_OPTIONS = [
  { value: 0, label: '낮음', color: '#4CAF50', icon: 'arrow-down' },
  { value: 1, label: '보통', color: '#FF9800', icon: 'minus' },
  { value: 2, label: '높음', color: '#F44336', icon: 'arrow-up' },
] as const;

export const MEMO_COLORS = [
  '#FFE082', // 노란색
  '#FFAB91', // 주황색
  '#F8BBD9', // 분홍색
  '#CE93D8', // 보라색
  '#90CAF9', // 파란색
  '#A5D6A7', // 초록색
  '#FFCDD2', // 빨간색
  '#D7CCC8', // 갈색
  '#F5F5F5', // 회색
] as const;

export const MEMO_LIMITS = {
  MAX_TAGS: 5,
  MAX_CONTENT_LENGTH: 1000,
  MAX_TAG_LENGTH: 20,
  PREVIEW_CONTENT_LENGTH: 30,
  PREVIEW_TAGS_COUNT: 5,
} as const;

export const SEARCH_CONFIG = {
  PLACEHOLDER: '제목, 내용, 태그 검색...',
  MIN_QUERY_LENGTH: 1,
} as const;

export const UI_MESSAGES = {
  EMPTY_MEMOS: {
    TITLE: '아직 메모가 없네요',
    SUBTITLE: '첫 번째 메모를 작성해보세요!',
  },
  EMPTY_SEARCH: {
    TITLE: '검색 결과가 없어요',
    SUBTITLE: '다른 키워드로 검색해보세요.',
  },
  LOADING: '메모를 불러오는 중...',
  DELETE_CONFIRMATION: {
    TITLE: '메모 삭제',
    MESSAGE: '이 메모를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  },
  ERRORS: {
    LOGIN_REQUIRED: '로그인이 필요합니다.',
    SAVE_FAILED: '메모 저장에 실패했습니다.',
    DELETE_FAILED: '메모 삭제에 실패했습니다.',
  },
} as const;
