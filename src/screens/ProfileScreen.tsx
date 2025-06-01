import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { authService } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMemos } from '../store/slices/memosSlice';
import type { RootState, AppDispatch } from '../store';
import type { StickerMemo } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useThemeContext } from '../contexts/ThemeContext';

// Theme context is now implemented in ../contexts/ThemeContext.tsx


const getDisplayName = (user: User | null): string => {
  if (!user) return '사용자';
  return user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';
};

const getAvatarLabel = (user: User | null): string => {
  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

function getWeekRange(date: Date): { startOfWeek: Date, endOfWeek: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(d.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
}

export default function ProfileScreen() {
  const paperTheme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, isDarkMode, toggleTheme } = useThemeContext();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  const {
    memos: allUserMemos,
    isLoading: isLoadingMemos,
    error: errorMemos
  } = useSelector((state: RootState) => state.memos);

  // Notifications state (functionality is "준비 중")
  const [notificationsEnabled] = useState(true);


  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      setErrorUser(null);
      const { user, error: fetchError } = await authService.getCurrentUser();
      if (fetchError) {
        setErrorUser('사용자 정보를 불러오는데 실패했습니다.');
      } else {
        setCurrentUser(user);
      }
      setIsLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      if (allUserMemos.length === 0 && !isLoadingMemos) {
        dispatch(fetchMemos(currentUser.id));
      }
    }
  }, [currentUser, dispatch, allUserMemos.length, isLoadingMemos]);

  const userStats = React.useMemo(() => {
    if (!allUserMemos || allUserMemos.length === 0) {
      return { totalMemos: 0, totalSchedules: 0, memosThisWeek: 0 };
    }
    const totalMemos = allUserMemos.length;
    const totalSchedules = allUserMemos.reduce((count, memo: StickerMemo) => {
      if ((memo as any).due_date || (memo as any).reminder_at) return count + 1;
      if (memo.tags && memo.tags.includes('일정')) return count + 1;
      return count;
    }, 0);
    const { startOfWeek, endOfWeek } = getWeekRange(new Date());
    const memosThisWeek = allUserMemos.filter((memo: StickerMemo) => {
      const createdAtDate = new Date(memo.created_at);
      return createdAtDate >= startOfWeek && createdAtDate <= endOfWeek;
    }).length;
    return { totalMemos, totalSchedules, memosThisWeek };
  }, [allUserMemos]);

  // Dark Mode Toggle now uses the real theme context


  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?',
      [{ text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: async () => {
          setIsLoadingUser(true);
          const { error: signOutError } = await authService.signOut();
          setIsLoadingUser(false);
          if (signOutError) {
            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
          } else {
            setCurrentUser(null);
            // TODO: Navigate to Login/Auth screen
          }
        }
      }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert('계정 삭제', '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      [{ text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: () => {
          Alert.alert('알림', '계정 삭제 기능은 현재 준비 중입니다.');
        }
      }]
    );
  };

  if (isLoadingUser && !currentUser) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={paperTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: paperTheme.colors.onBackground }}>프로필 로딩 중...</Text>
      </View>
    );
  }

  if (errorUser && !currentUser) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: paperTheme.colors.background }]}>
        <IconButton icon="alert-circle-outline" size={48} iconColor={paperTheme.colors.error} />
        <Text style={{ color: paperTheme.colors.error, marginBottom: 16, textAlign: 'center' }}>{errorUser}</Text>
        <Button mode="outlined" onPress={() => { /* Retry */ }}>다시 시도</Button>
      </View>
    );
  }

  const displayName = getDisplayName(currentUser);
  const avatarLabel = getAvatarLabel(currentUser);
  const avatarUrl = currentUser?.user_metadata?.avatar_url;

  const statsData = [
    { label: '총 메모', value: isLoadingMemos ? '...' : userStats.totalMemos },
    { label: '총 일정', value: isLoadingMemos ? '...' : userStats.totalSchedules },
    { label: '이번 주 작성', value: isLoadingMemos ? '...' : userStats.memosThisWeek },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
      <Card style={[styles.card, styles.userCard]} elevation={1}>
        <Card.Content style={styles.userContent}>
          {avatarUrl ? (
            <Avatar.Image size={80} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={80}
              label={avatarLabel}
              style={[styles.avatar, { backgroundColor: paperTheme.colors.primaryContainer }]}
              labelStyle={{ color: paperTheme.colors.onPrimaryContainer }}
            />
          )}
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={[styles.userName, { color: paperTheme.colors.onSurface }]}>{displayName}</Text>
            {currentUser?.email && (<Text variant="bodyMedium" style={[styles.userEmail, { color: paperTheme.colors.onSurfaceVariant }]}>{currentUser.email}</Text>)}
            {currentUser?.created_at && (<Text variant="bodySmall" style={[styles.joinDate, { color: paperTheme.colors.onSurfaceVariant }]}>가입일: {new Date(currentUser.created_at).toLocaleDateString('ko-KR')}</Text>)}
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.statsCard]} elevation={1}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>나의 사용 통계</Text>
          <View style={styles.statsContainer}>
            {statsData.map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: paperTheme.colors.primary }]}>{stat.value}</Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          {errorMemos && (<Text style={{ color: paperTheme.colors.error, textAlign: 'center', marginTop: 8, fontSize: 12 }}>통계 로딩 중 오류 발생</Text>)}
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.settingsCard]} elevation={1}>
        <Card.Content style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
          <List.Section title="앱 설정" titleStyle={{ marginLeft: 16, color: paperTheme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
            <List.Item
              title="다크 모드"
              description={theme === 'system' ? '시스템 설정에 따름' : (isDarkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중')}
              titleStyle={{ color: paperTheme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  color={paperTheme.colors.primary}
                />
              )}
            />
            <Divider style={{ backgroundColor: paperTheme.colors.outlineVariant }} />
            <List.Item
              title="알림"
              description="알림 (준비 중)" // Updated description
              titleStyle={{ color: paperTheme.colors.onSurface }}
              descriptionStyle={{ color: paperTheme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="bell-outline" color={paperTheme.colors.onSurfaceVariant} />}
              right={() => (
                <Switch
                  value={notificationsEnabled} // This state is not really used for toggling now
                  // onValueChange={setNotificationsEnabled} // Removed direct toggle
                  disabled // Disable the switch
                  color={paperTheme.colors.primary}
                />
              )}
              onPress={() => Alert.alert("알림 설정", "알림 기능은 현재 준비 중입니다.")} // Alert on press
              style={styles.listItem}
            />
            {/* 자동 동기화 섹션 제거됨 */}
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.menuCard]} elevation={1}>
        <Card.Content style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
          <List.Section title="정보 및 지원" titleStyle={{ marginLeft: 16, color: paperTheme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
            <List.Item
              title="도움말 및 FAQ"
              titleStyle={{ color: paperTheme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="help-circle-outline" color={paperTheme.colors.onSurfaceVariant} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={paperTheme.colors.onSurfaceVariant} />}
              onPress={() => navigation.navigate('HelpScreen')}
              style={styles.listItem}
            />
            <Divider style={{ backgroundColor: paperTheme.colors.outlineVariant }} />
            <List.Item
              title="개인정보 처리방침"
              titleStyle={{ color: paperTheme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="shield-lock-outline" color={paperTheme.colors.onSurfaceVariant} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={paperTheme.colors.onSurfaceVariant} />}
              onPress={() => navigation.navigate('PrivacyPolicyScreen')}
              style={styles.listItem}
            />
            <Divider style={{ backgroundColor: paperTheme.colors.outlineVariant }} />
            <List.Item
              title="앱 정보"
              description="버전 1.0.0 (Sticker Memo)"
              titleStyle={{ color: paperTheme.colors.onSurface }}
              descriptionStyle={{ color: paperTheme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="information-outline" color={paperTheme.colors.onSurfaceVariant} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={paperTheme.colors.onSurfaceVariant} />}
              onPress={() => Alert.alert('앱 정보', '앱 정보 화면으로 이동합니다 (구현 예정)')}
              style={styles.listItem}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.accountCard]} elevation={1}>
        <Card.Content>
          <Button
            mode="elevated"
            icon="logout"
            onPress={handleLogout}
            style={styles.actionButton}
            labelStyle={{ fontSize: 16 }}
            loading={isLoadingUser && currentUser != null}
          >로그아웃</Button>
          <Button
            mode="text"
            icon="delete-outline"
            onPress={handleDeleteAccount}
            style={[styles.actionButton, styles.deleteButton]}
            textColor={paperTheme.colors.error}
            labelStyle={{ fontSize: 16 }}
          >계정 삭제</Button>
        </Card.Content>
      </Card>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  userCard: {},
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userEmail: {
    marginBottom: 4,
  },
  joinDate: {},
  statsCard: {},
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {},
  statLabel: {
    marginTop: 6,
  },
  settingsCard: {},
  listItem: {
    paddingHorizontal: 16,
  },
  menuCard: {},
  accountCard: {
    marginBottom: 32,
  },
  actionButton: {
    marginVertical: 8,
    paddingVertical: 6,
  },
  deleteButton: {},
});