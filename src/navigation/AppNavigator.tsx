import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking } from 'react-native';

// 화면 컴포넌트들
import LoginScreen from '../screens/LoginScreen';
import MemosScreen from '../screens/MemosScreen';
import CreateMemoScreen from '../screens/CreateMemoScreen';
import MemoDetailScreen from '../screens/MemoDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import LotteryScreen from '../screens/LotteryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

// 타입 정의
import type { RootStackParamList, BottomTabParamList } from '../types';
import type { RootState, AppDispatch } from '../store';
import { getCurrentUser, setUser } from '../store/slices/authSlice';
import { authService } from '../services/supabase';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// 메인 탭 네비게이터
function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Memos':
              iconName = focused ? 'note-multiple' : 'note-multiple-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Lottery':
              iconName = focused ? 'dice-multiple' : 'dice-multiple-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Memos" 
        component={MemosScreen}
        options={{ title: '메모' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: '일정' }}
      />
      <Tab.Screen 
        name="Lottery" 
        component={LotteryScreen}
        options={{ title: '로또' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
}

// 메인 앱 네비게이터
export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // --- 딥링크를 수동으로 처리하는 함수 ---
    const handleDeepLink = async (url: string | null): Promise<void> => {
      if (!url) return;
      console.log('🔗 AppNavigator: Handling deep link:', url);
      // URL에서 해시(#) 부분을 추출
      const hash = url.split('#')[1];
      if (!hash) return;
      // 파라미터 파싱
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        console.log('🔧 AppNavigator: Tokens found in URL. Setting session manually...');
        try {
          const { error } = await authService.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error('❌ AppNavigator: Manual session setup failed:', error.message);
          } else {
            console.log('✅ AppNavigator: Manual session setup successful. onAuthStateChange should now fire.');
          }
        } catch (e) {
          console.error('❌ AppNavigator: An exception occurred during manual session setup:', e);
        }
      } else {
        console.log('ℹ️ AppNavigator: No access/refresh tokens found in the URL hash.');
      }
    };

    // 1. 앱 시작 시 현재 세션 확인
    authService.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ AppNavigator: 초기 세션 발견, 사용자 정보 설정:', session.user.email);
        dispatch(setUser({ user: session.user, session: session }));
      }
    });

    // 2. onAuthStateChange 리스너 설정
    const { data: { subscription } } = authService.onAuthStateChange(
      (_event, session) => {
        console.log('🔐 AppNavigator: Auth state changed event received:', _event);
        dispatch(setUser(session ? { user: session.user, session: session } : null));
        if (session) {
          console.log('✅ AppNavigator: Redux store updated with new session.', session.user.email);
        } else {
          console.log('👋 AppNavigator: Redux store updated for logout.');
        }
      }
    );

    // 3. 딥링크 URL 리스너 설정
    const deepLinkSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 앱이 딥링크로 시작되었을 때 초기 URL 처리
    Linking.getInitialURL().then(url => {
      handleDeepLink(url);
    });

    // 4. 컴포넌트 언마운트 시 모든 리스너 정리
    return () => {
      subscription?.unsubscribe();
      deepLinkSubscription?.remove();
    };
  }, [dispatch]);

  // 로딩 중일 때는 로딩 화면을 보여줄 수 있습니다
  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen name="CreateMemo" component={CreateMemoScreen} />
          <Stack.Screen name="MemoDetail" component={MemoDetailScreen} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
} 