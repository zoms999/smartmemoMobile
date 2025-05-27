import Constants from 'expo-constants';

export const debugSupabaseConfig = () => {
  console.log('🔍 Supabase 설정 디버깅...');
  
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://huaywahzggygziwvrcpy.supabase.co';
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXl3YWh6Z2d5Z3ppd3ZyY3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDU0NTgsImV4cCI6MjA1MjQyMTQ1OH0.AzLgXZvbjNO41ucSJlb4Al1dVY1O4f35254M40EfNyI';
  
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key 출처:', Constants.expoConfig?.extra?.supabaseAnonKey ? 'app.json extra' : 'fallback');
  console.log('🔑 Key (앞 30자):', `${supabaseAnonKey.substring(0, 30)}...`);
  console.log('🔑 Key (뒤 30자):', `...${supabaseAnonKey.substring(supabaseAnonKey.length - 30)}`);
  
  // JWT 토큰 분석
  try {
    const parts = supabaseAnonKey.split('.');
    console.log('🔍 JWT parts:', parts.length);
    
    if (parts.length === 3) {
      const headerDecoded = JSON.parse(atob(parts[0]));
      const payloadDecoded = JSON.parse(atob(parts[1]));
      
      console.log('📊 JWT Header:', headerDecoded);
      console.log('📊 JWT Payload:', payloadDecoded);
      console.log('🎯 프로젝트 ref 값:', payloadDecoded.ref);
      console.log('🎯 URL과 ref 일치 여부:', supabaseUrl.includes(payloadDecoded.ref));
      console.log('📅 토큰 만료일:', new Date(payloadDecoded.exp * 1000).toLocaleString());
      
      // ref 값 상세 비교
      if (supabaseUrl.includes('huaywahzggygziwvrcpy')) {
        if (payloadDecoded.ref === 'huaywahzggygziwvrcpy') {
          console.log('✅ JWT ref와 URL이 완벽하게 일치합니다!');
        } else {
          console.log('❌ JWT ref 불일치:', {
            expected: 'huaywahzggygziwvrcpy',
            actual: payloadDecoded.ref
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ JWT 디코딩 실패:', error);
  }
}; 