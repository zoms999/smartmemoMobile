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

// 스티커 메모 관련 타입
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
};

export type BottomTabParamList = {
  Memos: undefined;
  Calendar: undefined;
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