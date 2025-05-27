import { supabase } from '../services/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...');
    
    // 1. 기본 연결 테스트
    const { data, error } = await supabase.from('memos').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase 연결 실패:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공!');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 오류:', error);
    return false;
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('🔍 Supabase 인증 테스트 시작...');
    
    // 현재 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ 인증 세션 확인 실패:', error.message);
      return false;
    }
    
    if (session) {
      console.log('✅ 활성 세션 발견:', session.user.email);
    } else {
      console.log('ℹ️ 활성 세션 없음 (로그인 필요)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 인증 테스트 오류:', error);
    return false;
  }
};

export const validateApiKey = async () => {
  console.log('🔍 API Key 유효성 검사 시작...');
  
  try {
    // 간단한 테이블 조회로 API Key 검증
    const { data, error } = await supabase
      .from('memos')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ API Key 무효함:', error.message);
      return false;
    }
    
    console.log('✅ API Key 유효함');
    return true;
  } catch (error) {
    console.error('❌ API Key 검증 중 오류:', error);
    return false;
  }
}; 