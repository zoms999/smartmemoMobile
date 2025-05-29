import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 화면 컴포넌트들
import LoginScreen from '../screens/LoginScreen';
import MemosScreen from '../screens/MemosScreen';
import CreateMemoScreen from '../screens/CreateMemoScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

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
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 앱 시작 시 현재 사용자 정보 확인
    dispatch(getCurrentUser());

    // Supabase 인증 상태 변화 감지
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ 사용자 로그인 성공:', session.user.email);
          // 로그인 성공 시 Redux store 업데이트
          dispatch(setUser(session.user));
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 사용자 로그아웃');
          // 로그아웃 시 Redux store 초기화
          dispatch(setUser(null));
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 토큰 갱신됨:', session.user.email);
          dispatch(setUser(session.user));
        } else {
          console.log('ℹ️ 기타 인증 이벤트:', event, session?.user?.email || 'no user');
        }
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  // 로딩 중일 때는 로딩 화면을 보여줄 수 있습니다
  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
        <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen name="CreateMemo" component={CreateMemoScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
} 