import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { signIn, clearError } from '../store/slices/authSlice';
import { authService } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // OAuth URL이 반환되면 웹브라우저에서 열기
        Alert.alert(
          'Google 로그인', 
          '브라우저에서 Google 로그인을 완료해주세요.',
          [
            { text: '확인', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('오류', 'Google 로그인 중 예상치 못한 오류가 발생했습니다.');
    }
  };

  const handleEmailLogin = async () => {
    if (email && password) {
      dispatch(signIn({ email, password }));
    }
  };

  const handleAppleLogin = async () => {
    try {
      // TODO: Apple 로그인 구현
      console.log('Apple login');
      Alert.alert('알림', 'Apple 로그인은 곧 지원될 예정입니다.');
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            스티커 메모 & 일정 관리
          </Title>
          <Paragraph style={styles.subtitle}>
            로그인하여 메모와 일정을 동기화하세요
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="이메일"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                label="비밀번호"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                disabled={isLoading}
              />
              <Button
                mode="contained"
                onPress={handleEmailLogin}
                loading={isLoading}
                disabled={!email || !password || isLoading}
                style={styles.button}
              >
                로그인
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>또는</Text>
            <Divider style={styles.divider} />
          </View>

          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            icon="google"
            style={[styles.socialButton, { backgroundColor: '#4285F4' }]}
            textColor="white"
            disabled={isLoading}
          >
            Google로 회원가입/로그인
          </Button>

          {Platform.OS === 'ios' && (
            <Button
              mode="outlined"
              onPress={handleAppleLogin}
              icon="apple"
              style={styles.socialButton}
              disabled={isLoading}
            >
              Apple로 로그인
            </Button>
          )}

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
                backgroundColor: theme.colors.primaryContainer,
                opacity: 0.7 
              }]}
              disabled={isLoading}
            >
              테스트 로그인 (개발용)
            </Button>
          )}

          <View style={styles.footer}>
            <Text>계정이 없으신가요? </Text>
            <Text style={{ color: theme.colors.primary }}>
              Google 버튼을 눌러 가입하세요
            </Text>
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
    </KeyboardAvoidingView>
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
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  card: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.6,
  },
  socialButton: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
}); 