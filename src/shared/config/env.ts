/**
 * 환경 변수 설정
 * .env 파일을 생성하고 다음 변수들을 설정하세요:
 * EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
 * EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 */

export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'StickerMemoApp',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  DEV_MODE: process.env.EXPO_PUBLIC_DEV_MODE === 'true',
} as const;

// 환경 변수 유효성 검사
export const validateEnv = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;
  
  for (const varName of requiredVars) {
    if (!ENV[varName]) {
      throw new Error(`환경 변수 ${varName}이 설정되지 않았습니다.`);
    }
  }
}; 