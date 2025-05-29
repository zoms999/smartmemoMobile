import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  TouchableOpacity,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootState, AppDispatch } from '../store';
import { fetchMemos, clearError, deleteMemo, togglePinMemo } from '../store/slices/memosSlice';
import type { StickerMemo, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type MemosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PRIORITY_DETAILS = {
  'low': { label: '낮음', icon: 'arrow-down-circle-outline', color: '#4CAF50' },
  'medium': { label: '보통', icon: 'minus-circle-outline', color: '#FF9800' },
  'high': { label: '높음', icon: 'arrow-up-circle-outline', color: '#F44336' },
};

export default function MemosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const navigation = useNavigation<MemosScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);
  const { user } = useSelector((state: RootState) => state.auth);

  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMemos(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredMemos = useMemo(() => {
    // 메모 정렬: 고정된 메모 우선, 그 다음 최신 수정/생성 순
    const sortedMemos = [...memos].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA; // 최신순
    });

    if (searchQuery.trim() === '') {
      return sortedMemos;
    }
    const query = searchQuery.toLowerCase();
    return sortedMemos.filter(
      memo =>
        memo.title.toLowerCase().includes(query) ||
        memo.content.toLowerCase().includes(query) ||
        memo.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [memos, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteMemo = (memoId: string) => {
    setMenuVisibleId(null);
    Alert.alert(
      '메모 삭제',
      '이 메모를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => dispatch(deleteMemo(memoId)),
        },
      ]
    );
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
    // TODO: EditMemo 화면으로 이동 (현재는 MemoDetail로 이동)
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
    const priorityDetail = PRIORITY_DETAILS[item.priority] || PRIORITY_DETAILS['medium'];
    const cardBackgroundColor = item.color || theme.colors.surface;
    const isDarkBackground = theme.dark || ['#333333', '#000000'].includes(cardBackgroundColor.toLowerCase());
    const textColor = isDarkBackground ? theme.colors.onSurface : '#333';

    return (
      <Card
        style={[styles.memoCard, { backgroundColor: cardBackgroundColor }]}
        onPress={() => handleEditMemo(item)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {item.is_pinned && (
              <IconButton icon="pin" size={18} iconColor={theme.colors.primary} style={styles.pinIcon} />
            )}
            <Text variant="titleMedium" style={[styles.memoTitle, { color: textColor }]} numberOfLines={1}>
              {item.title || item.content.substring(0, 30) + (item.content.length > 30 ? '...' : '')}
            </Text>
            <Menu
              visible={menuVisibleId === item.id}
              onDismiss={() => setMenuVisibleId(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={22}
                  iconColor={textColor}
                  onPress={() => setMenuVisibleId(item.id)}
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

          {item.title && (
            <Text
              variant="bodyMedium"
              numberOfLines={4}
              style={[styles.memoContent, { color: textColor }]}
            >
              {item.content}
            </Text>
          )}

          {(item.tags && item.tags.length > 0) && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 5).map((tag) => (
                <Chip
                  key={`${item.id}-${tag}`}
                  mode="outlined"
                  compact
                  style={[styles.tag, { borderColor: isDarkBackground ? '#666' : '#ccc' }]}
                  textStyle={[styles.tagText, { color: isDarkBackground ? '#ddd' : '#555' }]}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              {/* 카테고리는 StickerMemo 타입에 없으므로 주석 처리 */}
              {/* {item.category && (
                <View style={styles.categoryContainer}>
                   <View style={[styles.categoryColorDot, { backgroundColor: item.category.color || theme.colors.primary }]} />
                   <Text style={[styles.footerText, { color: textColor, opacity: 0.8 }]}>{item.category.name}</Text>
                </View>
              )} */}
              {/* 리마인더도 StickerMemo 타입에 없으므로 주석 처리 */}
              {/* {item.reminder && (
                <View style={styles.reminderContainer}>
                    <IconButton icon="bell-outline" size={14} iconColor={textColor} style={{margin:0, padding:0}}/>
                    <Text style={[styles.footerText, { color: textColor, opacity: 0.8 }]}>{formatDateTime(item.reminder)}</Text>
                </View>
              )} */}
            </View>
            <View style={styles.footerRight}>
                <IconButton icon={priorityDetail.icon} size={16} iconColor={priorityDetail.color} style={{margin:0, padding:0}}/>
                <Text style={[styles.footerText, { color: textColor, opacity: 0.8, marginLeft: 2 }]}>
                    {priorityDetail.label}
                </Text>
            </View>
          </View>
           <Text variant="bodySmall" style={[styles.dateText, { color: textColor, opacity: 0.6 }]}>
            최종 수정: {formatDateTime(item.updated_at || item.created_at)}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && memos.length === 0) {
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
    </View>
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
    paddingBottom: 80,
  },
  memoCard: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinIcon: {
    marginRight: 4,
    marginLeft: -8,
  },
  memoTitle: {
    flex: 1,
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
  },
  memoContent: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  tag: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  footerText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
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