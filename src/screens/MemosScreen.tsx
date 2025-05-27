import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootState, AppDispatch } from '../store';
import { fetchMemos, clearError, deleteMemo, togglePinMemo } from '../store/slices/memosSlice';
import type { StickerMemo, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type MemosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function MemosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemos, setFilteredMemos] = useState<StickerMemo[]>([]);
  const theme = useTheme();
  
  const navigation = useNavigation<MemosScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);
  const { user } = useSelector((state: RootState) => state.auth);

  // 컴포넌트 마운트 시 메모 데이터 가져오기
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMemos(user.id));
    }
  }, [dispatch, user?.id]);

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMemos(memos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = memos.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredMemos(filtered);
    }
  }, [memos, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteMemo = (memoId: string) => {
    Alert.alert(
      '메모 삭제',
      '이 메모를 삭제하시겠습니까?',
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
    dispatch(togglePinMemo({ id: memoId, isPinned: !currentPinStatus }));
  };

  const handleCreateMemo = () => {
    navigation.navigate('CreateMemo');
  };

  const handleMemoPress = (memo: StickerMemo) => {
    // TODO: 메모 상세/편집 화면으로 네비게이션
    console.log('Navigate to memo detail:', memo.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5252';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return theme.colors.primary;
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const renderMemoCard = ({ item }: { item: StickerMemo }) => (
    <Card
      style={[
        styles.memoCard,
        { backgroundColor: item.color }
      ]}
      onPress={() => handleMemoPress(item)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.memoTitle}>
            {item.title}
          </Text>
          <View style={styles.cardActions}>
            <View
              style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(item.priority) }
              ]}
            />
            <IconButton
              icon={item.is_pinned ? 'pin' : 'pin-outline'}
              size={16}
              onPress={() => handleTogglePin(item.id, item.is_pinned)}
            />
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert(
                  '메모 옵션',
                  '원하는 작업을 선택하세요.',
                  [
                    { text: '취소', style: 'cancel' },
                    { text: '편집', onPress: () => handleMemoPress(item) },
                    { 
                      text: '삭제', 
                      style: 'destructive',
                      onPress: () => handleDeleteMemo(item.id) 
                    },
                  ]
                );
              }}
            />
          </View>
        </View>
        
        <Text
          variant="bodyMedium"
          numberOfLines={3}
          style={styles.memoContent}
        >
          {item.content}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <Chip
              key={`${item.id}-${tag}`}
              mode="outlined"
              compact
              style={styles.tag}
              textStyle={styles.tagText}
            >
              {tag}
            </Chip>
          ))}
        </View>
        
        <Text variant="bodySmall" style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </Card.Content>
    </Card>
  );

  if (isLoading && memos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>메모를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="메모 검색..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {filteredMemos.length === 0 ? (
        <View style={[styles.container, styles.centerContent]}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery ? '검색 결과가 없습니다.' : '아직 메모가 없습니다.'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery ? '다른 키워드로 검색해보세요.' : '새 메모를 만들어보세요!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMemos}
          renderItem={renderMemoCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => user?.id && dispatch(fetchMemos(user.id))}
        />
      )}
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateMemo}
      />

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
    backgroundColor: '#FAFAFA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 8,
  },
  memoCard: {
    flex: 1,
    margin: 8,
    maxWidth: (width - 48) / 2,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  memoTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  memoContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
    height: 24,
  },
  tagText: {
    fontSize: 10,
  },
  dateText: {
    opacity: 0.6,
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.5,
  },
}); 