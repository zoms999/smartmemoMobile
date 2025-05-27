import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  useTheme,
  Appbar,
  Snackbar,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import type { RootState, AppDispatch } from '../store';
import { createMemo } from '../store/slices/memosSlice';

type CreateMemoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateMemo'
>;

const MEMO_COLORS = [
  '#FFE082', // 노란색
  '#FFAB91', // 주황색
  '#F8BBD9', // 분홍색
  '#CE93D8', // 보라색
  '#90CAF9', // 파란색
  '#A5D6A7', // 초록색
  '#FFCDD2', // 빨간색
  '#D7CCC8', // 갈색
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
];

export default function CreateMemoScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMO_COLORS[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const theme = useTheme();
  const navigation = useNavigation<CreateMemoScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.memos);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveMemo = async () => {
    if (!title.trim()) {
      setSnackbarMessage('제목을 입력해주세요.');
      setShowSnackbar(true);
      return;
    }

    if (!content.trim()) {
      setSnackbarMessage('내용을 입력해주세요.');
      setShowSnackbar(true);
      return;
    }

    if (!user?.id) {
      setSnackbarMessage('로그인이 필요합니다.');
      setShowSnackbar(true);
      return;
    }

    try {
      const memoData = {
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
        tags,
        priority,
        is_pinned: false,
      };

      const result = await dispatch(createMemo(memoData));
      
      if (createMemo.fulfilled.match(result)) {
        // 성공적으로 생성되면 이전 화면으로 돌아가기
        navigation.goBack();
      } else {
        setSnackbarMessage('메모 저장에 실패했습니다.');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('메모 생성 오류:', error);
      setSnackbarMessage('메모 저장 중 오류가 발생했습니다.');
      setShowSnackbar(true);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim() || tags.length > 0) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="새 메모" />
        <Appbar.Action 
          icon="check" 
          onPress={handleSaveMemo}
          disabled={isLoading}
        />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 제목 입력 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              제목
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="메모 제목을 입력하세요"
              mode="outlined"
              style={styles.titleInput}
              maxLength={100}
            />
          </Card.Content>
        </Card>

        {/* 내용 입력 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              내용
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="메모 내용을 입력하세요"
              mode="outlined"
              multiline
              numberOfLines={8}
              style={styles.contentInput}
              maxLength={1000}
            />
          </Card.Content>
        </Card>

        {/* 색상 선택 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              색상
            </Text>
            <View style={styles.colorContainer}>
              {MEMO_COLORS.map((color) => (
                <Button
                  key={color}
                  mode={selectedColor === color ? 'contained' : 'outlined'}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color }
                  ]}
                  contentStyle={styles.colorButtonContent}
                >
                  {selectedColor === color ? '✓' : ''}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 우선순위 선택 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              우선순위
            </Text>
            <SegmentedButtons
              value={priority}
              onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              buttons={PRIORITY_OPTIONS}
              style={styles.priorityButtons}
            />
          </Card.Content>
        </Card>

        {/* 태그 입력 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              태그
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="태그를 입력하고 추가 버튼을 누르세요"
                mode="outlined"
                style={styles.tagInput}
                onSubmitEditing={handleAddTag}
                maxLength={20}
              />
              <Button
                mode="contained"
                onPress={handleAddTag}
                disabled={!tagInput.trim()}
                style={styles.addTagButton}
              >
                추가
              </Button>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    mode="outlined"
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 미리보기 */}
        <Card style={[styles.section, styles.previewSection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              미리보기
            </Text>
            <Card
              style={[
                styles.previewCard,
                { backgroundColor: selectedColor }
              ]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.previewTitle}>
                  {title || '제목 없음'}
                </Text>
                <Text variant="bodyMedium" style={styles.previewContent}>
                  {content || '내용 없음'}
                </Text>
                {tags.length > 0 && (
                  <View style={styles.previewTagsContainer}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        mode="outlined"
                        compact
                        style={styles.previewTag}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>메모를 저장하는 중...</Text>
        </View>
      )}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  titleInput: {
    backgroundColor: 'white',
  },
  contentInput: {
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 4,
  },
  colorButtonContent: {
    width: 50,
    height: 50,
  },
  priorityButtons: {
    marginTop: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  addTagButton: {
    alignSelf: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    marginTop: 8,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  previewTag: {
    height: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'white',
    fontSize: 16,
  },
}); 