import Constants from 'expo-constants';

export const forceApiKeyTest = async () => {
  console.log('🔍 강제 API Key 테스트 시작...');
  
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://huaywahzggygziwvrcpy.supabase.co';
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXl3YWh6Z2d5Z3ppd3ZyY3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDU0NTgsImV4cCI6MjA1MjQyMTQ1OH0.AzLgXZvbjNO41ucSJlb4Al1dVY1O4f35254M40EfNyI';
  
  console.log('📍 테스트 URL:', supabaseUrl);
  console.log('🔑 테스트 Key (앞 30자):', `${supabaseAnonKey.substring(0, 30)}...`);
  console.log('🔑 테스트 Key (뒤 30자):', `...${supabaseAnonKey.substring(supabaseAnonKey.length - 30)}`);
  
  try {
    // 직접 fetch로 API 테스트
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 응답 상태:', response.status);
    console.log('📊 응답 상태 텍스트:', response.statusText);
    
    if (response.status === 200) {
      console.log('✅ API Key 유효함!');
      return true;
    }
    
    console.log('❌ API Key 무효함 - 상태:', response.status);
    
    // 응답 헤더 확인
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('📊 응답 헤더:', headers);
    
    return false;
  } catch (error) {
    console.error('❌ API 테스트 중 오류:', error);
    return false;
  }
}; 