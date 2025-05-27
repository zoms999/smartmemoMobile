import { createClient, type Session } from '@supabase/supabase-js';
import { ENV, validateEnv } from '../config/env';

// 환경 변수 유효성 검사
try {
  validateEnv();
} catch (error) {
  console.error('Supabase 설정 오류:', error);
}

// Supabase 클라이언트 생성
export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      // 자동 토큰 갱신 설정
      autoRefreshToken: true,
      // 세션 감지 설정
      detectSessionInUrl: false,
      // 영구 세션 설정
      persistSession: true,
    },
    realtime: {
      // 실시간 연결 설정
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// 연결 상태 확인 함수
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase 연결 확인 실패:', error);
    return false;
  }
};

// 인증 상태 변경 리스너 설정
export const setupAuthListener = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    callback(session);
  });
}; 