import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Chip,
  IconButton,
  Searchbar,
  useTheme,
  Snackbar,
  ActivityIndicator,
  Menu,
  Divider,
  Avatar,
  Dialog,
  Portal,
  Button,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import type { RootState, AppDispatch } from '../store';
import { fetchMemos, clearError, deleteMemo, togglePinMemo } from '../store/slices/memosSlice';
import type { StickerMemo, RootStackParamList } from '../types';

type MemosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PRIORITY_DETAILS = {
  'low': { label: '낮음', icon: 'arrow-down-circle-outline', color: '#4CAF50' },
  'medium': { label: '보통', icon: 'minus-circle-outline', color: '#FF9800' },
  'high': { label: '높음', icon: 'arrow-up-circle-outline', color: '#F44336' },
};

// [추가 1] 정렬을 위한 우선순위 숫자 값
const PRIORITY_VALUES = {
  'high': 3,
  'medium': 2,
  'low': 1,
};

// [추가 2] DB의 숫자 우선순위를 문자열 키로 변환하는 맵
const PRIORITY_MAP: { [key: number]: 'low' | 'medium' | 'high' } = {
  0: 'low',
  1: 'medium',
  2: 'high',
};


// 배경색에 따라 적절한 텍스트 색상(검정/흰색)을 반환하는 헬퍼 함수
const getTextColorForBackground = (hexColor: string) => {
  if (!hexColor || hexColor.length < 7) {
    return '#000000'; // 기본값으로 검정색 반환
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // WCAG 명도 계산 공식
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF'; // 밝으면 검정, 어두우면 흰색
};


export default function MemosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const navigation = useNavigation<MemosScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);
  const { user } = useSelector((state: RootState) => state.auth);

  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [memoToDelete, setMemoToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMemos(user.id));
    }
  }, [dispatch, user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        dispatch(fetchMemos(user.id));
      }
    }, [dispatch, user?.id])
  );

  // [수정 1] 정렬 로직 수정
  const filteredMemos = useMemo(() => {
    const sortedMemos = [...memos].sort((a, b) => {
      // 1. 고정 여부 정렬 (가장 먼저)
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // 2. 우선순위 정렬 (높음 -> 낮음 순)
      const priorityKeyA = PRIORITY_MAP[a.priority as number] || 'medium';
      const priorityKeyB = PRIORITY_MAP[b.priority as number] || 'medium';
      
      const priorityValueA = PRIORITY_VALUES[priorityKeyA];
      const priorityValueB = PRIORITY_VALUES[priorityKeyB];

      if (priorityValueA !== priorityValueB) {
        return priorityValueB - priorityValueA; // 높은 값이 먼저 오도록 내림차순 정렬
      }

      // 3. 우선순위가 같을 경우 최신순으로 정렬
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });

    if (searchQuery.trim() === '') {
      return sortedMemos;
    }
    const query = searchQuery.toLowerCase();
    return sortedMemos.filter(
      memo => {
        const memoData = memo as any;
        const content = memoData.text || memoData.content || '';
        const title = memoData.title || '';
        
        return (
          (title && title.toLowerCase().includes(query)) ||
          (content && content.toLowerCase().includes(query)) ||
          (memo.tags && memo.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
    );
  }, [memos, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteMemo = (memoId: string) => {
    if (!user?.id) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }
    setMenuVisibleId(null);
    setMemoToDelete(memoId);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!memoToDelete) return;
    dispatch(deleteMemo(memoToDelete));
    setDeleteDialogVisible(false);
    setMemoToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogVisible(false);
    setMemoToDelete(null);
  };

  const handleTogglePin = (memoId: string, currentPinStatus: boolean) => {
    setMenuVisibleId(null);
    dispatch(togglePinMemo({ id: memoId, isPinned: !currentPinStatus }));
  };

  const handleCreateMemo = () => {
    navigation.navigate('CreateMemo');
  };

  const handleEditMemo = (memo: StickerMemo) => {
    setMenuVisibleId(null);
    navigation.navigate('MemoDetail', { memoId: memo.id });
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const renderMemoCard = ({ item }: { item: StickerMemo }) => {
    // [수정 2] 표시 로직 수정
    // DB에서 온 숫자 priority를 문자열 키로 변환
    const priorityKey = PRIORITY_MAP[item.priority as number] || 'medium'; 
    // 변환된 키를 사용해 올바른 우선순위 정보를 가져옴
    const priorityDetail = PRIORITY_DETAILS[priorityKey];
    
    const accentColor = item.color || 'transparent'; 
    const textColor = theme.colors.onSurface;
    const secondaryTextColor = theme.colors.onSurfaceVariant;

    const memoData = item as any;
    const content = memoData.text || memoData.content || '';
    const title = memoData.title || '';

    return (
      <Card
        style={[
          styles.memoCard, 
          { 
            backgroundColor: theme.colors.surface,
            borderLeftColor: accentColor,
            borderLeftWidth: 5,
          }
        ]}
        onPress={() => handleEditMemo(item)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {item.is_pinned && (
              <IconButton icon="pin" size={18} iconColor={theme.colors.primary} style={styles.pinIcon} />
            )}
            <Text variant="titleMedium" style={[styles.memoTitle, { color: textColor }]} numberOfLines={1}>
              {title || (content ? content.substring(0, 30) + (content.length > 30 ? '...' : '') : '제목 없음')}
            </Text>
           
            <Menu
              visible={menuVisibleId === item.id}
              onDismiss={() => setMenuVisibleId(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={22}
                  iconColor={secondaryTextColor}
                  onPress={(e) => {
                    e.stopPropagation(); 
                    setMenuVisibleId(item.id)
                  }}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEditMemo(item)}
                title="편집"
                leadingIcon="pencil-outline"
              />
              <Menu.Item
                onPress={() => handleTogglePin(item.id, item.is_pinned || false)}
                title={item.is_pinned ? "고정 해제" : "고정하기"}
                leadingIcon={item.is_pinned ? "pin-off-outline" : "pin-outline"}
              />
              <Divider />
              <Menu.Item
                onPress={() => handleDeleteMemo(item.id)}
                title="삭제"
                leadingIcon="delete-outline"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>

          {content && (
            <Text
              variant="bodyMedium"
              numberOfLines={4}
              style={[styles.memoContent, { color: secondaryTextColor }]}
            >
              {content}
            </Text>
          )}

          {(item.tags && item.tags.length > 0) && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 5).map((tag) => (
                <Chip
                  key={`${item.id}-${tag}`}
                  mode="outlined"
                  compact
                  style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}
                  textStyle={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
             <Text variant="bodySmall" style={[styles.dateText, { color: secondaryTextColor }]}>
              {formatDateTime(item.updated_at || item.created_at)}
            </Text>
            
            <Chip 
              icon={priorityDetail.icon}
              compact
              style={[styles.priorityChip, { backgroundColor: priorityDetail.color }]}
              textStyle={[styles.priorityChipText, { color: getTextColorForBackground(priorityDetail.color) }]}
            >
              {priorityDetail.label}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && memos.length === 0 && !user?.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.statusText, { color: theme.colors.onBackground }]}>메모를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="제목, 내용, 태그 검색..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={theme.colors.primary}
      />

      {filteredMemos.length === 0 ? (
        <View style={[styles.container, styles.centerContent]}>
           <Avatar.Icon icon="note-multiple-outline" size={80} style={{backgroundColor: 'transparent'}} color={theme.colors.onSurfaceDisabled}/>
          <Text variant="headlineSmall" style={[styles.emptyText, { color: theme.colors.onBackground }]}>
            {searchQuery ? '검색 결과가 없어요' : '아직 메모가 없네요'}
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            {searchQuery ? '다른 키워드로 검색해보세요.' : '첫 번째 메모를 작성해보세요!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMemos}
          renderItem={renderMemoCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => user?.id && dispatch(fetchMemos(user.id))}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={handleCreateMemo}
        label="새 메모"
      />

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        duration={4000}
        action={{
          label: '닫기',
          onPress: handleDismissError,
        }}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{color: theme.colors.onErrorContainer}}>{error}</Text>
      </Snackbar>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={handleDeleteCancel}>
          <Dialog.Title>메모 삭제</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              이 메모를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDeleteCancel}>취소</Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              onPress={handleDeleteConfirm}
            >
              삭제
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// 스타일은 변경할 필요 없습니다.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 28,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80, // FAB에 가려지지 않도록 충분한 여백
  },
  memoCard: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden', // 테두리 radius 적용을 위해
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinIcon: {
    margin: 0,
    marginLeft: -8, // 왼쪽 여백 조절
    marginRight: 4,
  },
  memoTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  memoContent: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  tag: {
    borderWidth: 0,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16, 
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.8,
  },
  priorityChip: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16, // 텍스트 수직 정렬
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 16,
  },
});