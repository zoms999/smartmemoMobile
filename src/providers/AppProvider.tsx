import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import { ThemeProvider, useThemeContext } from '../contexts/ThemeContext';
import { testConnection, testAuth } from '../utils/simpleSupabaseTest';

interface AppProviderProps {
  children: ReactNode;
}

// Inner provider that uses theme context
const ThemedApp: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentTheme } = useThemeContext();
  
  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </PaperProvider>
  );
};

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
        <ThemeProvider>
          <ThemedApp>
            {children}
          </ThemedApp>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
};