import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Title,
  Paragraph,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { signIn, clearError } from '../store/slices/authSlice';
import { authService } from '../services/supabase';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export default function LoginScreen() {
  const theme = useTheme();
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        Alert.alert('로그인 오류', error.message || 'Google 로그인 중 오류가 발생했습니다.');
        return;
      }

      if (data?.url) {
        // InAppBrowser 우선 사용, 불가 시 Linking으로 fallback
        if (await InAppBrowser.isAvailable()) {
          await InAppBrowser.open(data.url, {
            // iOS 옵션
            dismissButtonStyle: 'cancel',
            // Android 옵션
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: false,
          });
        } else {
          await Linking.openURL(data.url);
        }
      } else {
        Alert.alert('오류', '로그인 URL을 받아오지 못했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error instanceof Error) {
        Alert.alert('오류', error.message || 'Google 로그인 중 예상치 못한 오류가 발생했습니다.');
      }
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            메모로또 & 일정 관리
          </Title>
          <Paragraph style={styles.subtitle}>
            Google 계정으로 시작하여{'\n'}메모와 일정을 안전하게 동기화하세요
          </Paragraph>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleGoogleLogin}
              icon="google"
              style={[styles.socialButton, { backgroundColor: '#4285F4' }]}
              textColor="white"
              disabled={isLoading}
              loading={isLoading}
              contentStyle={styles.buttonContent}
            >
              Google로 시작하기
            </Button>

            {/* 개발 테스트용 버튼 */}
            {__DEV__ && (
              <Button
                mode="outlined"
                onPress={() => {
                  // 테스트용 사용자 정보로 로그인
                  dispatch(signIn({ email: 'test@example.com', password: 'test123' }));
                }}
                icon="account-check"
                style={[styles.socialButton, { 
                  backgroundColor: theme.colors.surfaceVariant,
                }]}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
              >
                테스트 로그인 (개발용)
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
      
      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        duration={4000}
        action={{
          label: '닫기',
          onPress: handleDismissError,
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center', // 콘텐츠를 중앙 정렬
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 60, // 버튼과의 간격 확보
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320, // 버튼 최대 너비 지정
  },
  socialButton: {
    marginBottom: 16,
  },
  buttonContent: {
    height: 48, // 버튼 높이 통일
    justifyContent: 'center',
  },
});