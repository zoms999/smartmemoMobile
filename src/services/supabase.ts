import 'react-native-url-polyfill/auto';
import { createClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Supabase 설정 (환경 변수에서 가져오기)
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://huaywahzggygziwvrcpy.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXl3YWh6Z2d5Z3ppd3ZyY3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDU0NTgsImV4cCI6MjA1MjQyMTQ1OH0.AzLgXZvbjNO41ucSJlb4Al1dVY1O4f35254M40EfNyI';

// API Key 로드 디버깅
console.log('🔍 Supabase 클라이언트 생성 중...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 실제 사용될 API Key (앞 50자):', `${supabaseAnonKey.substring(0, 50)}...`);
console.log('🔑 실제 사용될 API Key (뒤 50자):', `...${supabaseAnonKey.substring(supabaseAnonKey.length - 50)}`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // URL에서 세션 자동 감지 활성화
  },
});

// 테스트용 사용자 데이터
const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: '테스트 사용자',
  },
  created_at: new Date().toISOString(),
};

// 인증 관련 헬퍼 함수들
export const authService = {
  // 이메일로 회원가입
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // 이메일로 로그인
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Google 로그인/회원가입
  async signInWithGoogle() {
    // 플랫폼에 따른 리다이렉트 URL 설정
    let redirectTo: string;
    
    if (__DEV__) {
      // 웹인지 확인 (window 객체가 있으면 웹)
      const isWeb = typeof window !== 'undefined' && window.location;
      redirectTo = isWeb 
        ? 'http://localhost:8081'  // Expo Web 개발 시
        : 'exp://localhost:8081';  // Expo Go 또는 개발 클라이언트 사용 시
    } else {
      redirectTo = `${Constants.expoConfig?.scheme}://auth`;
    }

    console.log('🔗 Google 로그인 redirectTo:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { data, error };
  },

  // Apple 로그인
  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    return { data, error };
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 세션 상태 변화 감지
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 비밀번호 재설정
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },
}; 