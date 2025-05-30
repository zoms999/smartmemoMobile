import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Appbar,
  Chip,
  IconButton,
  ActivityIndicator,
  FAB,
  Menu,
  Divider,
  Snackbar,
  TextInput,
  Button,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, StickerMemo } from '../types';
import type { RootState, AppDispatch } from '../store';
import { 
  fetchMemos, 
  deleteMemo, 
  togglePinMemo, 
  setSelectedMemo,
  clearError,
  updateMemo
} from '../store/slices/memosSlice';

type MemoDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MemoDetail'
>;

type MemoDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoDetail'>;

const PRIORITY_DETAILS = {
  'low': { label: '낮음', icon: 'arrow-down-circle-outline', color: '#4CAF50' },
  'medium': { label: '보통', icon: 'minus-circle-outline', color: '#FF9800' },
  'high': { label: '높음', icon: 'arrow-up-circle-outline', color: '#F44336' },
};

export default function MemoDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MemoDetailScreenNavigationProp>();
  const route = useRoute<MemoDetailScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { memoId } = route.params;
  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);

  const [menuVisible, setMenuVisible] = useState(false);

  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 현재 메모 찾기
  const memo = memos.find(m => m.id === memoId);

  useEffect(() => {
    if (memo) {
      dispatch(setSelectedMemo(memo));
      // 편집 상태 초기화
      const memoData = memo as any;
      const content = memoData.text || memoData.content || '';
      setEditText(content);
      setEditTags([...memo.tags]);
    }
  }, [memo, dispatch]);

  useEffect(() => {
    // 컴포넌트 언마운트 시 selectedMemo 초기화
    return () => {
      dispatch(setSelectedMemo(null));
    };
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteMemo = () => {
    setMenuVisible(false);
    Alert.alert(
      '메모 삭제',
      '이 메모를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteMemo(memoId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleTogglePin = () => {
    setMenuVisible(false);
    if (memo) {
      dispatch(togglePinMemo({ id: memoId, isPinned: !memo.is_pinned }));
    }
  };

  const handleEditMemo = () => {
    setMenuVisible(false);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (memo) {
      // 원래 상태로 복원
      const memoData = memo as any;
      const content = memoData.text || memoData.content || '';
      setEditText(content);
      setEditTags([...memo.tags]);
      setTagInput('');
    }
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!memo) return;

    if (!editText.trim()) {
      Alert.alert('오류', '메모 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        id: memo.id,
        updates: {
          text: editText.trim(),
          tags: editTags,
          updated_at: new Date().toISOString(),
        }
      };

      console.log('📝 메모 수정 요청:', updateData);
      
      const result = await dispatch(updateMemo(updateData));
      
      if (updateMemo.fulfilled.match(result)) {
        console.log('✅ 메모 수정 성공:', result.payload);
        setIsEditMode(false);
        setTagInput('');
      } else {
        console.error('❌ 메모 수정 실패:', result.payload);
        Alert.alert('오류', '메모 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 메모 수정 예외:', error);
      Alert.alert('오류', '메모 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    
    if (!newTag) return;
    
    if (editTags.includes(newTag)) {
      Alert.alert('알림', '이미 추가된 태그입니다.');
      return;
    }

    if (editTags.length >= 5) {
      Alert.alert('알림', '태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }

    setEditTags([...editTags, newTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.statusText, { color: theme.colors.onBackground }]}>
          메모를 불러오는 중...
        </Text>
      </View>
    );
  }

  if (!memo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="메모 상세" />
        </Appbar.Header>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            메모를 찾을 수 없습니다.
          </Text>
          <TouchableOpacity onPress={handleBack}>
            <Text style={[styles.backText, { color: theme.colors.primary }]}>
              돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const priorityDetail = PRIORITY_DETAILS[memo.priority] || PRIORITY_DETAILS['medium'];
  const cardBackgroundColor = memo.color || theme.colors.surface;
  const isDarkBackground = theme.dark || ['#333333', '#000000'].includes(cardBackgroundColor.toLowerCase());
  const textColor = isDarkBackground ? theme.colors.onSurface : '#333';

  // 실제 데이터 구조에 맞게 필드 매핑
  const memoData = memo as any;
  const content = memoData.text || memoData.content || '';
  const title = memoData.title || '';

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={isEditMode ? handleCancelEdit : handleBack} />
        <Appbar.Content 
          title={isEditMode ? '메모 편집' : (title || '메모 상세')} 
          titleStyle={{ fontSize: 18 }}
        />
        {!isEditMode && memo.is_pinned && (
          <Appbar.Action icon="pin" onPress={() => {}} disabled />
        )}
        {isEditMode ? (
          <>
            <Appbar.Action 
              icon="close" 
              onPress={handleCancelEdit}
              disabled={isSaving}
            />
            <Appbar.Action 
              icon="check" 
              onPress={handleSaveEdit}
              disabled={isSaving}
            />
          </>
        ) : (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action 
                icon="dots-vertical" 
                onPress={() => setMenuVisible(true)} 
              />
            }
          >
            <Menu.Item
              onPress={handleEditMemo}
              title="편집"
              leadingIcon="pencil-outline"
            />
            <Menu.Item
              onPress={handleTogglePin}
              title={memo.is_pinned ? "고정 해제" : "고정하기"}
              leadingIcon={memo.is_pinned ? "pin-off-outline" : "pin-outline"}
            />
            <Divider />
            <Menu.Item
              onPress={handleDeleteMemo}
              title="삭제"
              leadingIcon="delete-outline"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        )}
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card 
          style={[
            styles.memoCard, 
            { backgroundColor: cardBackgroundColor }
          ]}
        >
          <Card.Content style={styles.cardContent}>
            {isEditMode ? (
              /* 편집 모드 UI */
              <>
                {/* 메모 내용 편집 */}
                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    메모 내용
                  </Text>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    placeholder="메모 내용을 입력하세요..."
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    style={[styles.textInput, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                    maxLength={1000}
                  />
                  <Text style={[styles.characterCount, { color: textColor }]}>
                    {editText.length}/1000
                  </Text>
                </View>

                {/* 태그 편집 */}
                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    태그 ({editTags.length}/5)
                  </Text>
                  
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="태그를 입력하세요"
                      mode="outlined"
                      style={[styles.tagInput, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                      onSubmitEditing={handleAddTag}
                      maxLength={20}
                    />
                    <Button
                      mode="contained"
                      onPress={handleAddTag}
                      disabled={!tagInput.trim() || editTags.length >= 5}
                      style={styles.addTagButton}
                    >
                      추가
                    </Button>
                  </View>

                  {editTags.length > 0 && (
                    <View style={styles.tagsWrapper}>
                      {editTags.map((tag) => (
                        <Chip
                          key={tag}
                          mode="outlined"
                          onClose={() => handleRemoveTag(tag)}
                          style={[styles.tag, { borderColor: isDarkBackground ? '#666' : '#ccc' }]}
                          textStyle={[styles.tagText, { color: isDarkBackground ? '#ddd' : '#555' }]}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  )}
                </View>

                {/* 저장 버튼 */}
                <View style={styles.saveButtonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleSaveEdit}
                    loading={isSaving}
                    disabled={isSaving || !editText.trim()}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                  >
                    {isSaving ? '저장 중...' : '변경사항 저장'}
                  </Button>
                </View>
              </>
            ) : (
              /* 보기 모드 UI (기존) */
              <>
                {/* 헤더 정보 */}
                <View style={styles.headerInfo}>
                  <View style={styles.priorityContainer}>
                    <IconButton 
                      icon={priorityDetail.icon} 
                      iconColor={priorityDetail.color} 
                      size={20}
                      style={styles.priorityIcon}
                    />
                    <Text style={[styles.priorityText, { color: textColor }]}>
                      우선순위: {priorityDetail.label}
                    </Text>
                  </View>
                </View>

                {/* 제목 */}
                {title && (
                  <Text 
                    variant="headlineSmall" 
                    style={[styles.memoTitle, { color: textColor }]}
                  >
                    {title}
                  </Text>
                )}

                {/* 내용 */}
                <Text 
                  variant="bodyLarge" 
                  style={[styles.memoContent, { color: textColor }]}
                >
                  {content || '내용이 없습니다.'}
                </Text>

                {/* 태그 */}
                {memo.tags && memo.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                      태그
                    </Text>
                    <View style={styles.tagsWrapper}>
                      {memo.tags.map((tag) => (
                        <Chip
                          key={`${memo.id}-${tag}`}
                          mode="outlined"
                          style={[styles.tag, { borderColor: isDarkBackground ? '#666' : '#ccc' }]}
                          textStyle={[styles.tagText, { color: isDarkBackground ? '#ddd' : '#555' }]}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {/* 메타 정보 */}
                <View style={styles.metaInfo}>
                  <Text style={[styles.metaText, { color: textColor, opacity: 0.7 }]}>
                    생성일: {formatDateTime(memo.created_at)}
                  </Text>
                  {memo.updated_at && memo.updated_at !== memo.created_at && (
                    <Text style={[styles.metaText, { color: textColor, opacity: 0.7 }]}>
                      수정일: {formatDateTime(memo.updated_at)}
                    </Text>
                  )}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {!isEditMode && (
        <FAB
          icon="pencil"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={handleEditMemo}
          label="편집"
        />
      )}

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
    </KeyboardAvoidingView>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  memoCard: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  cardContent: {
    padding: 20,
  },
  headerInfo: {
    marginBottom: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    marginLeft: -8,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  memoTitle: {
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 32,
  },
  memoContent: {
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  editSection: {
    marginBottom: 20,
  },
  textInput: {
    marginBottom: 8,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    marginLeft: 8,
  },
  saveButtonContainer: {
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 16,
  },
  saveButtonContent: {
    padding: 16,
  },
}); 