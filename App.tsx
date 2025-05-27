import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { AppProvider } from './src/providers/AppProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/services/supabase';

export default function App() {
  useEffect(() => {
    // 딥링크 처리
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      console.log('🔗 Deep link received in App.tsx:', url);

      // OAuth 콜백 URL 처리
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        console.log('✅ OAuth callback URL detected in App.tsx.');
        
        try {
          // Supabase가 자동으로 세션을 처리하도록 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 세션 상태 확인
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ App.tsx: Error getting session after OAuth callback:', error.message);
            
            // 수동으로 URL에서 토큰 추출 시도
            const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            const expiresAt = urlParams.get('expires_at');
            
            if (accessToken && refreshToken) {
              console.log('🔧 App.tsx: Attempting manual session setup...');
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (setSessionError) {
                console.error('❌ App.tsx: Manual session setup failed:', setSessionError.message);
              } else {
                console.log('✅ App.tsx: Manual session setup successful');
              }
            }
          } else if (session) {
            console.log('✅ App.tsx: Session successfully established:', session.user?.email);
          } else {
            console.log('ℹ️ App.tsx: No active session found after OAuth callback processing.');
          }
        } catch (err) {
          console.error('❌ App.tsx: Error processing OAuth callback:', err);
        }
      }
    };

    // 앱이 실행 중일 때 딥링크 처리
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 앱이 딥링크로 시작된 경우 처리
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App.tsx: Initial URL on app start:', url);
        handleDeepLink(url);
      } else {
        console.log('App.tsx: No initial URL on app start.');
      }
    }).catch(err => console.warn('App.tsx: Failed to get initial URL', err));

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AppProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AppProvider>
  );
} 