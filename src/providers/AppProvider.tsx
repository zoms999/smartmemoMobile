import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import { lightTheme } from '../theme';
import { testConnection, testAuth } from '../utils/simpleSupabaseTest';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  useEffect(() => {
    // 앱 시작 시 Supabase 연결 테스트
    const runTests = async () => {
      console.log('🚀 앱 시작 - Supabase 테스트 실행');
      await testConnection();
      await testAuth();
    };
    
    runTests();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={lightTheme}>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}; 