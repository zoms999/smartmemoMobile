import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Switch,
  Button,
  Avatar,
  Divider,
  useTheme,
} from 'react-native-paper';

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const theme = useTheme();

  // 임시 사용자 데이터
  const user = {
    name: '홍길동',
    email: 'hong@example.com',
    avatar: null,
    joinDate: '2024-01-01',
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => {
            // TODO: 실제 로그아웃 로직 구현
            console.log('Logout');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            // TODO: 계정 삭제 로직 구현
            console.log('Delete account');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 사용자 정보 카드 */}
      <Card style={styles.userCard}>
        <Card.Content style={styles.userContent}>
          <Avatar.Text 
            size={80} 
            label={user.name.charAt(0)}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user.name}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user.email}
            </Text>
            <Text variant="bodySmall" style={styles.joinDate}>
              가입일: {new Date(user.joinDate).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* 통계 카드 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            사용 통계
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                12
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                총 메모
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                8
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                총 일정
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                5
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                이번 주
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 설정 섹션 */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            설정
          </Text>
          
          <List.Item
            title="다크 모드"
            description="어두운 테마 사용"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="알림"
            description="푸시 알림 받기"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="자동 동기화"
            description="데이터 자동 백업"
            left={props => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* 기타 메뉴 */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <List.Item
            title="도움말"
            description="사용법 및 FAQ"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Navigate to help')}
          />
          
          <Divider />
          
          <List.Item
            title="개인정보 처리방침"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Navigate to privacy policy')}
          />
          
          <Divider />
          
          <List.Item
            title="앱 정보"
            description="버전 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Navigate to app info')}
          />
        </Card.Content>
      </Card>

      {/* 계정 관리 */}
      <Card style={styles.accountCard}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
          >
            로그아웃
          </Button>
          
          <Button
            mode="text"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            textColor={theme.colors.error}
          >
            계정 삭제
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  userCard: {
    margin: 16,
    marginBottom: 8,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 2,
  },
  joinDate: {
    opacity: 0.5,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#6366F1',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  accountCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
}); 