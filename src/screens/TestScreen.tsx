import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { supabase } from '../services/supabase';

export const TestScreen: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('테스트 대기 중...');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('테스트 중...');

    try {
      // 1. 기본 연결 테스트
      const { data, error } = await supabase
        .from('memos')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setTestResult(`❌ 연결 실패: ${error.message}`);
      } else {
        setTestResult('✅ Supabase 연결 성공!');
      }
    } catch (error: any) {
      setTestResult(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResult('인증 테스트 중...');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setTestResult(`❌ 인증 오류: ${error.message}`);
      } else if (session) {
        setTestResult(`✅ 로그인됨: ${session.user.email}`);
      } else {
        setTestResult('ℹ️ 로그인 필요');
      }
    } catch (error: any) {
      setTestResult(`❌ 인증 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Supabase 연결 테스트
          </Text>
          
          <Text style={styles.result}>{testResult}</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={testConnection}
              loading={loading}
              style={styles.button}
            >
              연결 테스트
            </Button>
            
            <Button
              mode="outlined"
              onPress={testAuth}
              loading={loading}
              style={styles.button}
            >
              인증 테스트
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  result: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
}); 