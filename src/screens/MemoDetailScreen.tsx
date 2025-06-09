import React, { useEffect, useState, useRef } from 'react'; // useRef 추가
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput, // TextInput 이름 충돌 방지를 위해 별칭 사용
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Appbar,
  Chip,
  IconButton,
  ActivityIndicator,
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

function getColorLuminance(hexColor: string): number {
  if (!hexColor || !hexColor.startsWith('#')) return 0.5;
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return 0.5;

  let rHex, gHex, bHex;
  if (hex.length === 3) {
    [rHex, gHex, bHex] = [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2]];
  } else {
    [rHex, gHex, bHex] = [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)];
  }

  const [r, g, b] = [parseInt(rHex, 16) / 255, parseInt(gHex, 16) / 255, parseInt(bHex, 16) / 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

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
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const memo = memos.find(m => m.id === memoId);
  
  // *** UX 개선: 편집 모드 진입 시 텍스트 입력창에 자동 포커스 ***
  const contentInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (memo) {
      dispatch(setSelectedMemo(memo));
      const memoData = memo as any;
      const content = memoData.text || memoData.content || '';
      setEditContent(content);
      setEditTags([...memo.tags]);
    }
  }, [memo, dispatch]);

  // *** UX 개선: 편집 모드로 전환되면 내용 입력창에 바로 포커스 ***
  useEffect(() => {
    if (isEditMode) {
      setTimeout(() => contentInputRef.current?.focus(), 100);
    }
  }, [isEditMode]);

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
    Alert.alert('메모 삭제', '이 메모를 정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteMemo(memoId));
          navigation.goBack();
        },
      },
    ]);
  };
  
  // *** UI/UX 개선: 핸들러 이름 명확화 ***
  const handleTogglePinOnAppBar = () => {
    if (memo) {
      dispatch(togglePinMemo({ id: memoId, isPinned: !memo.is_pinned }));
    }
  };

  const handleEnterEditMode = () => {
    setMenuVisible(false);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (memo) {
      const memoData = memo as any;
      const content = memoData.text || memoData.content || '';
      setEditContent(content);
      setEditTags([...memo.tags]);
      setTagInput('');
    }
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!memo || !editContent.trim()) {
      Alert.alert('오류', '메모 내용을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await dispatch(updateMemo({
        id: memo.id,
        updates: { content: editContent.trim(), tags: editTags, updated_at: new Date().toISOString() },
      }));
      if (updateMemo.fulfilled.match(result)) {
        setIsEditMode(false);
        setTagInput('');
      } else {
        Alert.alert('오류', '메모 수정에 실패했습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '메모 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/\s+/g, '-'); // 공백을 하이픈으로 변경
    if (!newTag || editTags.includes(newTag)) {
        if (editTags.includes(newTag)) Alert.alert('알림', '이미 추가된 태그입니다.');
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
    if (editTags.length < 5 && !editTags.includes(tagToAdd)) {
        setEditTags([...editTags, tagToAdd]);
    } else if (editTags.length >= 5) {
        Alert.alert('알림', '태그는 최대 5개까지 추가할 수 있습니다.');
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (isLoading && !memo) {
    return (
      <View style={styles.centerContent}><ActivityIndicator /></View>
    );
  }

  if (!memo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header><Appbar.BackAction onPress={handleBack} /><Appbar.Content title="메모 없음" /></Appbar.Header>
        <View style={styles.centerContent}>
          <IconButton icon="alert-circle-outline" size={48} iconColor={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>메모를 찾을 수 없습니다.</Text>
          <Button mode="outlined" onPress={handleBack}>돌아가기</Button>
        </View>
      </View>
    );
  }
  
  const priorityDetail = PRIORITY_DETAILS[memo.priority] || PRIORITY_DETAILS['medium'];
  const cardBackgroundColor = memo.color || theme.colors.surface;
  const luminance = getColorLuminance(cardBackgroundColor);
  const finalCardContentColor = luminance > 0.55 ? '#121212' : '#FDFDFD';
  const cardIsActuallyDark = luminance <= 0.55;
  const textInputBackgroundColor = cardIsActuallyDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)';
  const chipBorderColor = cardIsActuallyDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const chipTextColor = finalCardContentColor;
  const memoData = memo as any;
  const content = memoData.text || memoData.content || '';
  const title = memoData.title || '';
  const filteredSuggestedTags = FREQUENTLY_USED_TAGS.filter(tag => !editTags.includes(tag));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={isEditMode ? handleCancelEdit : handleBack} />
        <Appbar.Content title={isEditMode ? '메모 편집' : (title || '메모 상세')} titleStyle={{ fontWeight: '600' }} />
        
        {isEditMode ? (
          <Appbar.Action icon="check" onPress={handleSaveEdit} disabled={isSaving || !editContent.trim()} />
        ) : (
          <>
            {/* --- UI/UX 개선: '고정' 아이콘을 앱바에 직접 노출 --- */}
            <Appbar.Action icon={memo.is_pinned ? "pin" : "pin-outline"} onPress={handleTogglePinOnAppBar} />
            <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
              <Menu.Item onPress={handleEnterEditMode} title="편집" leadingIcon="pencil-outline" />
              <Divider style={{ marginVertical: 4 }}/>
              <Menu.Item onPress={handleDeleteMemo} title="삭제" leadingIcon="delete-outline" titleStyle={{ color: theme.colors.error }} />
            </Menu>
          </>
        )}
      </Appbar.Header>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={[styles.memoCard, { backgroundColor: cardBackgroundColor }, !memo.color && { borderColor: theme.colors.outline, borderWidth: 1 }]} elevation={memo.color ? 4 : 1}>
          <Card.Content style={styles.cardContent}>
            {isEditMode ? (
              <>
                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>메모 내용</Text>
                  <TextInput
                    ref={contentInputRef}
                    value={editContent}
                    onChangeText={setEditContent}
                    placeholder="메모 내용을 입력하세요..."
                    mode="outlined"
                    multiline
                    style={[styles.textInput, { backgroundColor: textInputBackgroundColor, minHeight: Platform.OS === 'ios' ? 150 : 120 }]}
                    outlineColor={finalCardContentColor}
                    activeOutlineColor={theme.colors.primary}
                    placeholderTextColor={finalCardContentColor + '99'}
                    theme={{ colors: { onSurfaceVariant: finalCardContentColor + 'AA' }}}
                    maxLength={1000}
                  />
                  <Text style={[styles.characterCount, { color: finalCardContentColor }]}>{editContent.length}/1000</Text>
                </View>

                <View style={styles.editSection}>
                  <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>태그 ({editTags.length}/5)</Text>
                  
                  {/* --- UI/UX 개선: 태그 입력 UI 통합 --- */}
                  <View style={[styles.tagEditContainer, { borderColor: finalCardContentColor, backgroundColor: textInputBackgroundColor }]}>
                    {editTags.map((tag) => (
                      <Chip key={tag} mode="flat" onClose={() => handleRemoveTag(tag)} style={styles.tagInInput} textStyle={styles.tagTextInInput} elevation={1}>
                        {tag}
                      </Chip>
                    ))}
                    <TextInput
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder={editTags.length < 5 ? "태그 입력" : "최대 5개"}
                      style={styles.tagInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      onSubmitEditing={handleAddTag} // 엔터로 추가
                      editable={editTags.length < 5}
                      maxLength={20}
                    />
                  </View>
                  
                  {filteredSuggestedTags.length > 0 && editTags.length < 5 && (
                    <View style={styles.suggestedTagsSection}>
                      <Text style={[styles.suggestedTagsLabel, { color: finalCardContentColor }]}>추천 태그</Text>
                      <View style={styles.tagsWrapper}>
                        {filteredSuggestedTags.map((tag) => (
                          <Chip key={`suggest-${tag}`} mode="outlined" onPress={() => handleSelectSuggestedTag(tag)} style={[styles.suggestedTagChip, { borderColor: chipBorderColor + 'AA' }]}>
                            {tag}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.headerInfo}>
                    <Chip icon={priorityDetail.icon} selectedColor={priorityDetail.color} mode="flat" style={{backgroundColor: 'transparent'}}>
                        우선순위: {priorityDetail.label}
                    </Chip>
                </View>

                {title && <Text variant="headlineSmall" style={[styles.memoTitle, { color: finalCardContentColor }]}>{title}</Text>}
                
                <TouchableOpacity activeOpacity={0.7} onPress={handleEnterEditMode} accessibilityLabel="메모 내용 터치 시 편집">
                  <Text variant="bodyLarge" style={[styles.memoContent, { color: finalCardContentColor }]}>
                    {content || '내용이 없습니다. 탭하여 편집하세요.'}
                  </Text>
                </TouchableOpacity>

                {memo.tags && memo.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>태그</Text>
                    <View style={styles.tagsWrapper}>
                      {memo.tags.map((tag) => (
                        <Chip key={`${memo.id}-${tag}`} mode="outlined" style={[styles.tag, { borderColor: chipBorderColor, backgroundColor: cardIsActuallyDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]} textStyle={[styles.tagText, { color: chipTextColor }]} elevation={1}>
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.metaInfo, { borderTopColor: theme.colors.outlineVariant }]}>
                  <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>생성일: {formatDateTime(memo.created_at)}</Text>
                  {memo.updated_at !== memo.created_at && <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>수정일: {formatDateTime(memo.updated_at)}</Text>}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- UI/UX 개선: FAB 버튼 제거 --- */}
      {/*
      {!isEditMode && (
        <FAB icon="pencil" style={styles.fab} onPress={handleEnterEditMode} label="편집" />
      )}
      */}

      <Snackbar visible={!!error} onDismiss={() => dispatch(clearError())} duration={4000} action={{ label: '닫기', onPress: () => dispatch(clearError()) }} style={{ backgroundColor: theme.colors.errorContainer }}>
        <Text style={{color: theme.colors.onErrorContainer}}>{error}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  memoCard: { borderRadius: 16, marginBottom: 24 },
  cardContent: { paddingHorizontal: 20, paddingVertical: 24 },
  headerInfo: { marginBottom: 12, alignItems: 'flex-start' },
  memoTitle: { marginBottom: 18, lineHeight: 34 },
  memoContent: { lineHeight: 28, fontSize: 17, marginBottom: 24 },
  tagsContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, opacity: 0.9 },
  tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 2 },
  tagText: { fontSize: 13, fontWeight: '500' },
  metaInfo: { borderTopWidth: 1, paddingTop: 18, gap: 8 },
  metaText: { fontSize: 12, opacity: 0.6 },
  
  // -- Edit Mode Styles --
  editSection: { marginBottom: 24 },
  textInput: { marginBottom: 4, fontSize: 16 },
  characterCount: { alignSelf: 'flex-end', fontSize: 12, opacity: 0.7, marginTop: 4 },
  
  // -- Improved Tag Input Styles --
  tagEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 56,
  },
  tagInInput: {
    margin: 4,
    backgroundColor: '#E0E0E0' // A neutral color for tags inside input
  },
  tagTextInInput: {
    color: '#000000'
  },
  tagInput: {
    flex: 1,
    minWidth: 120, // Ensure input has enough space
    height: 48,
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
  },

  // -- Suggested Tags Styles --
  suggestedTagsSection: { marginTop: 20 },
  suggestedTagsLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, opacity: 0.8 },
  suggestedTagChip: { paddingVertical: 1 },
});