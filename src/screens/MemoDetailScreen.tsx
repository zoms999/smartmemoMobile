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

// Helper function to get luminance (0-1 scale, 0 is black, 1 is white)
function getColorLuminance(hexColor: string): number {
  if (!hexColor || !hexColor.startsWith('#')) return 0.5; // Default to mid-luminance if invalid
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return 0.5;

  let rHex, gHex, bHex;
  if (hex.length === 3) {
    rHex = hex[0] + hex[0];
    gHex = hex[1] + hex[1];
    bHex = hex[2] + hex[2];
  } else {
    rHex = hex.substring(0, 2);
    gHex = hex.substring(2, 4);
    bHex = hex.substring(4, 6);
  }

  const r = parseInt(rHex, 16) / 255;
  const g = parseInt(gHex, 16) / 255;
  const b = parseInt(bHex, 16) / 255;
  
  // Standard sRGB luminance formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Frequently used tags for suggestions
const FREQUENTLY_USED_TAGS = ['급함', '메모', '완료', '일정', '중요', '회의', '아이디어', '개인'];


export default function MemoDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MemoDetailScreenNavigationProp>();
  const route = useRoute<MemoDetailScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { memoId } = route.params;
  const { memos, isLoading, error } = useSelector((state: RootState) => state.memos);

  const [menuVisible, setMenuVisible] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const memo = memos.find(m => m.id === memoId);

  useEffect(() => {
    if (memo) {
      dispatch(setSelectedMemo(memo));
      const memoData = memo as any;
      const content = memoData.text || memoData.content || '';
      setEditText(content);
      setEditTags([...memo.tags]);
    }
  }, [memo, dispatch]);

  useEffect(() => {
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
      const result = await dispatch(updateMemo(updateData));
      if (updateMemo.fulfilled.match(result)) {
        setIsEditMode(false);
        setTagInput('');
      } else {
        Alert.alert('오류', '메모 수정에 실패했습니다.');
      }
    } catch (error) {
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

  const handleSelectSuggestedTag = (tagToAdd: string) => {
    if (editTags.includes(tagToAdd)) {
      // Optionally, do nothing or give subtle feedback if already added
      // Alert.alert('알림', '이미 추가된 태그입니다.'); 
      return;
    }
    if (editTags.length >= 5) {
      Alert.alert('알림', '태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    setEditTags([...editTags, tagToAdd]);
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

  if (isLoading && !memo) {
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
          <IconButton icon="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            메모를 찾을 수 없습니다.
          </Text>
          <Button mode="outlined" onPress={handleBack}>
            돌아가기
          </Button>
        </View>
      </View>
    );
  }

  const priorityDetail = PRIORITY_DETAILS[memo.priority] || PRIORITY_DETAILS['medium'];
  const cardBackgroundColor = memo.color || theme.colors.surface;

  let finalCardContentColor;
  let cardIsActuallyDark;

  if (memo.color && memo.color.startsWith('#')) {
    const luminance = getColorLuminance(memo.color);
    finalCardContentColor = luminance > 0.55 ? '#121212' : '#FDFDFD';
    cardIsActuallyDark = luminance <= 0.55;
  } else {
    finalCardContentColor = theme.colors.onSurface;
    cardIsActuallyDark = theme.dark;
  }
  
  const textInputBackgroundColor = memo.color 
    ? (cardIsActuallyDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)')
    : (theme.isV3 ? theme.colors.surfaceContainerLow : (theme.dark ? 'rgba(255,255,255,0.1)' : theme.colors.background));

  const chipBorderColor = cardIsActuallyDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const chipTextColor = cardIsActuallyDark ? '#EAEAEA' : '#2C2C2C';

  const memoData = memo as any;
  const content = memoData.text || memoData.content || '';
  const title = memoData.title || '';

  const filteredSuggestedTags = FREQUENTLY_USED_TAGS.filter(
    (tag) => !editTags.includes(tag)
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={isEditMode ? handleCancelEdit : handleBack} />
        <Appbar.Content
          title={isEditMode ? '메모 편집' : (title || '메모 상세')}
          titleStyle={{ fontWeight: '600' }}
        />
        {!isEditMode && memo.is_pinned && (
          <Appbar.Action icon="pin" onPress={() => {}} disabled />
        )}
        {isEditMode ? (
          <>
            <Appbar.Action
              icon="content-save"
              onPress={handleSaveEdit}
              disabled={isSaving || !editText.trim()}
            />
             <Appbar.Action
              icon="close-circle-outline"
              onPress={handleCancelEdit}
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
            <Divider style={{ marginVertical: 4 }}/>
            <Menu.Item
              onPress={handleDeleteMemo}
              title="삭제"
              leadingIcon="delete-outline"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        )}
      </Appbar.Header>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card
          style={[
            styles.memoCard,
            { backgroundColor: cardBackgroundColor },
            !memo.color && { borderColor: theme.colors.outline, borderWidth: 1}
          ]}
          elevation={memo.color ? 4 : 1}
        >
          <Card.Content style={styles.cardContent}>
            {isEditMode ? (
              <>
                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: finalCardContentColor, fontWeight: theme.fonts.titleMedium.fontWeight }]}>
                    메모 내용
                  </Text>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    placeholder="메모 내용을 입력하세요..."
                    mode="outlined"
                    multiline
                    numberOfLines={Platform.OS === 'ios' ? undefined : 6}
                    minHeight={Platform.OS === 'ios' ? 120 : undefined}
                    style={[styles.textInput, { backgroundColor: textInputBackgroundColor }]}
                    outlineColor={finalCardContentColor}
                    activeOutlineColor={theme.colors.primary}
                    placeholderTextColor={finalCardContentColor + '99'}
                    theme={{ colors: { onSurfaceVariant: finalCardContentColor + 'AA' }}}
                    maxLength={1000}
                  />
                  <Text style={[styles.characterCount, { color: finalCardContentColor, opacity: 0.7 }]}>
                    {editText.length}/1000
                  </Text>
                </View>

                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: finalCardContentColor, fontWeight: theme.fonts.titleMedium.fontWeight }]}>
                    태그 ({editTags.length}/5)
                  </Text>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="태그 입력 후 추가"
                      mode="outlined"
                      style={[styles.tagInput, { backgroundColor: textInputBackgroundColor }]}
                      outlineColor={finalCardContentColor}
                      activeOutlineColor={theme.colors.primary}
                      placeholderTextColor={finalCardContentColor + '99'}
                      theme={{ colors: { onSurfaceVariant: finalCardContentColor + 'AA' }}}
                      onSubmitEditing={handleAddTag}
                      maxLength={20}
                    />
                    <Button
                      mode="contained"
                      icon="plus-circle-outline"
                      onPress={handleAddTag}
                      disabled={!tagInput.trim() || editTags.length >= 5}
                      style={styles.addTagButton}
                      compact
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
                          style={[styles.tag, { borderColor: chipBorderColor, backgroundColor: cardIsActuallyDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                          textStyle={[styles.tagText, { color: chipTextColor }]}
                          closeIconAccessibilityLabel={`태그 ${tag} 삭제`}
                          elevation={1}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  )}

                  {/* 자주 사용되는 태그 섹션 */}
                  {filteredSuggestedTags.length > 0 && editTags.length < 5 && (
                    <View style={styles.suggestedTagsSection}>
                      <Text style={[styles.suggestedTagsLabel, { color: finalCardContentColor, opacity: 0.85 }]}>
                        자주 사용되는 태그
                      </Text>
                      <View style={styles.tagsWrapper}>
                        {filteredSuggestedTags.map((tag) => (
                          <Chip
                            key={`suggest-${tag}`}
                            mode="outlined"
                            onPress={() => handleSelectSuggestedTag(tag)}
                            style={[
                              styles.suggestedTagChip,
                              { 
                                borderColor: chipBorderColor + 'AA', // Slightly less prominent border
                                backgroundColor: cardIsActuallyDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                              }
                            ]}
                            textStyle={[styles.tagText, { color: chipTextColor, fontSize: 12 }]} // Slightly smaller text for suggestions
                          >
                            {tag}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
                <Button
                  mode="contained-tonal"
                  onPress={handleSaveEdit}
                  loading={isSaving}
                  disabled={isSaving || !editText.trim()}
                  style={styles.saveButton}
                  contentStyle={styles.saveButtonContent}
                  icon="content-save-check-outline"
                >
                  {isSaving ? '저장 중...' : '변경사항 저장'}
                </Button>
              </>
            ) : (
              <>
                <View style={styles.headerInfo}>
                  <View style={styles.priorityContainer}>
                    <IconButton
                      icon={priorityDetail.icon}
                      iconColor={priorityDetail.color}
                      size={22}
                      style={styles.priorityIcon}
                    />
                    <Text style={[styles.priorityText, { color: finalCardContentColor, fontWeight: theme.fonts.labelLarge.fontWeight }]}>
                      우선순위: {priorityDetail.label}
                    </Text>
                  </View>
                </View>

                {title && (
                  <Text
                    variant="headlineSmall"
                    style={[styles.memoTitle, { color: finalCardContentColor }]}
                  >
                    {title}
                  </Text>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEditMemo}
                  accessibilityLabel="메모 내용 터치 시 편집"
                >
                  <Text
                    variant="bodyLarge"
                    style={[styles.memoContent, { color: finalCardContentColor }]}
                  >
                    {content || '내용이 없습니다. 탭하여 편집하세요.'}
                  </Text>
                </TouchableOpacity>

                {memo.tags && memo.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={[styles.sectionTitle, { color: finalCardContentColor, fontWeight: theme.fonts.titleMedium.fontWeight }]}>
                      태그
                    </Text>
                    <View style={styles.tagsWrapper}>
                      {memo.tags.map((tag) => (
                        <Chip
                          key={`${memo.id}-${tag}`}
                          mode="outlined"
                          style={[styles.tag, { borderColor: chipBorderColor, backgroundColor: cardIsActuallyDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                          textStyle={[styles.tagText, { color: chipTextColor }]}
                          elevation={1}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.metaInfo, { borderTopColor: theme.colors.outlineVariant }]}>
                  <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>
                    생성일: {formatDateTime(memo.created_at)}
                  </Text>
                  {memo.updated_at && memo.updated_at !== memo.created_at && (
                    <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>
                      수정일: {formatDateTime(memo.updated_at)}
                    </Text>
                  )}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
        <View style={{ height: 80 }} />
      </ScrollView>

      {!isEditMode && (
        <FAB
          icon="pencil"
          style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
          color={theme.colors.onPrimaryContainer}
          onPress={handleEditMemo}
          label="편집"
          mode="flat"
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  memoCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerInfo: {
    marginBottom: 18,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    marginLeft: -10,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 15,
  },
  memoTitle: {
    marginBottom: 18,
    lineHeight: 34,
  },
  memoContent: {
    lineHeight: 26,
    marginBottom: 24,
    fontSize: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    marginBottom: 12,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8, // Add some top margin for tags wrapper in general
  },
  tag: {
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaInfo: {
    borderTopWidth: 1,
    paddingTop: 18,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
  editSection: {
    marginBottom: 24,
  },
  textInput: {
    marginBottom: 4,
    fontSize: 16,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8, // Space before current tags list
  },
  tagInput: {
    flex: 1,
    fontSize: 15,
  },
  addTagButton: {},
  saveButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
  saveButtonContent: {
    height: 52,
  },
  // Styles for Suggested Tags
  suggestedTagsSection: {
    marginTop: 20, // Space above the suggested tags label
  },
  suggestedTagsLabel: {
    fontSize: 14, // Slightly smaller than sectionTitle
    fontWeight: '500', // Medium weight
    marginBottom: 8, // Space between label and chips
  },
  suggestedTagChip: {
    paddingVertical: 1, // Make suggested chips a bit smaller
    // Dynamic styling for borderColor and backgroundColor is applied inline
  },
  // suggestedTagText style is applied inline for fontSize
});