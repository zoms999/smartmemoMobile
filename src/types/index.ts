// 사용자 관련 타입 (Supabase User와 호환)
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    [key: string]: unknown;
  };
}

// 태그 관련 타입
export interface Tag {
  id: number;
  name: string;
}

// 인기 태그 (사용빈도 포함)
export interface PopularTag extends Tag {
  usage_count: number;
}

// 카테고리 관련 타입
export interface Category {
  id: number;
  name: string;
  color: string;
}

// 메모 관련 타입 (새 스키마에 맞춰 수정)
export interface Memo {
  id: number;
  text: string;
  is_widget: boolean;
  category_id?: number;
  priority: number; // 0: 낮음, 1: 보통, 2: 높음
  tags: string[]; // 태그 이름 배열 (호환성 유지)
  color?: string;
  reminder?: string;
  images: string[]; // 이미지 URL 배열
  created_at: string;
  updated_at: string;
  widget_position?: {
    x: number;
    y: number;
  };
  widget_size?: {
    width: number;
    height: number;
  };
  user_id: string;
}

// 스티커 메모 관련 타입 (기존 호환성을 위해 유지)
export interface StickerMemo {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  position_x?: number;
  position_y?: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// 일정 관련 타입
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  reminder_minutes?: number;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeat_end_date?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// 네비게이션 관련 타입
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  CreateMemo: undefined;
  MemoDetail: { memoId: string };
  EventDetail: { eventId: string };
  Settings: undefined;
  HelpScreen: undefined;
  PrivacyPolicyScreen: undefined;
};

export type BottomTabParamList = {
  Memos: undefined;
  Calendar: undefined;
  Lottery: undefined;
  Profile: undefined;
};

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 앱 상태 관련 타입
export interface AppState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface MemosState {
  memos: StickerMemo[];
  selectedMemo: StickerMemo | null;
  isLoading: boolean;
  error: string | null;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

// 새 메모 생성을 위한 타입
export interface CreateMemoRequest {
  text: string;
  is_widget?: boolean;
  category_id?: number;
  priority: number;
  tags: string[];
  color?: string;
  reminder?: string;
  images?: string[];
  user_id: string;
}

// 로또 번호 관련 타입
export interface LotteryNumbers {
  id?: number;
  user_id: string;
  numbers: number[];
  bonus_number?: number;
  generation_method: 'AI' | 'MANUAL' | 'RANDOM';
  is_favorite: boolean;
  is_purchased: boolean;
  purchase_date?: string;
  draw_round?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 로또 번호 생성 요청 타입
export interface CreateLotteryNumbersRequest {
  numbers: number[];
  bonus_number?: number;
  generation_method: 'AI' | 'MANUAL' | 'RANDOM';
  is_favorite?: boolean;
  notes?: string;
} 