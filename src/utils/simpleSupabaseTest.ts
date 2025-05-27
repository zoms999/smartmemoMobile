import 'react-native-url-polyfill/auto'
import { supabase } from '../services/supabase';

// 간단한 연결 테스트 함수
export const testConnection = async () => {
  console.log('🧪 Supabase 연결 테스트 시작...');
  
  try {
    // 1. 기본 연결 테스트 (memos 테이블 존재 확인)
    const { data, error } = await supabase
      .from('memos')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ 연결 테스트 실패:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('📊 memos 테이블 레코드 수:', data);
    return true;
    
  } catch (error) {
    console.error('❌ 연결 테스트 중 예외:', error);
    return false;
  }
};

// 인증 테스트 함수
export const testAuth = async () => {
  console.log('🔐 Supabase 인증 테스트 시작...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ 인증 테스트 실패:', error.message);
      return false;
    }
    
    if (session) {
      console.log('✅ 활성 세션 존재:', session.user?.email);
    } else {
      console.log('ℹ️ 활성 세션 없음 (로그인 필요)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 인증 테스트 중 예외:', error);
    return false;
  }
}; 