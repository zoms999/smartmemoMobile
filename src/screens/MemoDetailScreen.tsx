import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  Animated,
  Dimensions,
  StatusBar,
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
  Surface,
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

const { width: screenWidth } = Dimensions.get('window');

const PRIORITY_DETAILS = {
  'low': { label: '낮음', icon: 'arrow-down-circle-outline', color: '#4CAF50', gradient: ['#4CAF50', '#8BC34A'] },
  'medium': { label: '보통', icon: 'minus-circle-outline', color: '#FF9800', gradient: ['#FF9800', '#FFC107'] },
  'high': { label: '높음', icon: 'arrow-up-circle-outline', color: '#F44336', gradient: ['#F44336', '#FF5722'] },
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

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const editModeAnim = useRef(new Animated.Value(0)).current;
  const tagAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  const memo = memos.find(m => m.id === memoId);
  const contentInputRef = useRef<RNTextInput>(null);

  // 진입 애니메이션
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 편집 모드 애니메이션
  useEffect(() => {
    Animated.timing(editModeAnim, {
      toValue: isEditMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isEditMode]);

  useEffect(() => {
    if (memo) {
      dispatch(setSelectedMemo(memo));
      const memoData = memo as any;
      // text와 content 필드 호환성 처리
      const content = memoData.text || memoData.content || '';
      setEditContent(content);
      setEditTags([...memo.tags]);
    }
  }, [memo, dispatch]);

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

  // 태그 애니메이션 함수
  const animateTagRemoval = (tag: string, callback: () => void) => {
    if (!tagAnimations[tag]) {
      tagAnimations[tag] = new Animated.Value(1);
    }
    
    Animated.timing(tagAnimations[tag], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      delete tagAnimations[tag];
    });
  };

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
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
      // text와 content 필드 호환성 처리
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
      // 메모 ID를 숫자로 변환 (Supabase 테이블 스키마와 일치)
      const memoId = parseInt(memo.id, 10);
      if (isNaN(memoId)) {
        Alert.alert('오류', '잘못된 메모 ID입니다.');
        setIsSaving(false);
        return;
      }

      // 업데이트 데이터 구조 수정 (Supabase 스키마와 일치)
      const updateData = {
        text: editContent.trim(), // content -> text로 변경
        tags: editTags,
        // updated_at 제거 (Supabase에서 자동 관리)
      };

      console.log('📝 메모 업데이트 요청:', { memoId, updateData });

      const result = await dispatch(updateMemo({
        id: memoId.toString(), // Redux action에서는 문자열 유지
        updates: updateData,
      }));

      if (updateMemo.fulfilled.match(result)) {
        console.log('✅ 메모 업데이트 성공');
        setIsEditMode(false);
        setTagInput('');
      } else {
        console.error('❌ 메모 업데이트 실패:', result.payload);
        Alert.alert('오류', '메모 수정에 실패했습니다.');
      }
    } catch (e) {
      console.error('❌ 메모 업데이트 예외:', e);
      Alert.alert('오류', '메모 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/\s+/g, '-');
    if (!newTag || editTags.includes(newTag)) {
        if (editTags.includes(newTag)) Alert.alert('알림', '이미 추가된 태그입니다.');
        return;
    }
    if (editTags.length >= 5) {
      Alert.alert('알림', '태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    
    // 태그 추가 애니메이션
    const newTagKey = newTag;
    tagAnimations[newTagKey] = new Animated.Value(0);
    setEditTags([...editTags, newTag]);
    setTagInput('');
    
    Animated.spring(tagAnimations[newTagKey], {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    animateTagRemoval(tagToRemove, () => {
      setEditTags(editTags.filter(tag => tag !== tagToRemove));
    });
  };
  
  const handleSelectSuggestedTag = (tagToAdd: string) => {
    if (editTags.length < 5 && !editTags.includes(tagToAdd)) {
        const newTagKey = tagToAdd;
        tagAnimations[newTagKey] = new Animated.Value(0);
        setEditTags([...editTags, tagToAdd]);
        
        Animated.spring(tagAnimations[newTagKey], {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }).start();
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
      <View style={[styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!memo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="메모 없음" />
        </Appbar.Header>
        <View style={styles.centerContent}>
          <IconButton icon="alert-circle-outline" size={48} iconColor={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>메모를 찾을 수 없습니다.</Text>
          <Button mode="outlined" onPress={handleBack}>돌아가기</Button>
        </View>
      </View>
    );
  }
  
  const priorityDetail = PRIORITY_DETAILS[memo.priority] || PRIORITY_DETAILS['medium'];
  
  // 🎨 메모 색상 처리: 메모에 색상이 있을 때만 카드에 적용
  const hasCustomColor = memo.color && memo.color !== theme.colors.surface;
  const cardBackgroundColor = hasCustomColor ? memo.color : theme.colors.surface;
  
  // 색상에 따른 텍스트 색상 계산
  const luminance = hasCustomColor ? getColorLuminance(cardBackgroundColor) : 0.5;
  const finalCardContentColor = hasCustomColor 
    ? (luminance > 0.55 ? '#121212' : '#FDFDFD')
    : theme.colors.onSurface;
  
  const cardIsActuallyDark = hasCustomColor ? luminance <= 0.55 : theme.dark;
  
  // 편집 모드에서의 색상 처리
  const textInputBackgroundColor = hasCustomColor 
    ? (cardIsActuallyDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)')
    : (theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
    
  const chipBorderColor = hasCustomColor 
    ? (cardIsActuallyDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')
    : theme.colors.outline;
    
  const chipTextColor = finalCardContentColor;
  const memoData = memo as any;
  const content = memoData.text || memoData.content || '';
  const title = memoData.title || '';
  const filteredSuggestedTags = FREQUENTLY_USED_TAGS.filter(tag => !editTags.includes(tag));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        backgroundColor={theme.colors.surface}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* 개선된 앱바 */}
        <Surface style={styles.appbarSurface} elevation={3}>
          <Appbar.Header style={[styles.appbar, { backgroundColor: 'transparent' }]}>
            <Appbar.BackAction onPress={isEditMode ? handleCancelEdit : handleBack} />
            <Appbar.Content 
              title={isEditMode ? '메모 편집' : (title || '메모 상세')} 
              titleStyle={[styles.appbarTitle, { color: theme.colors.onSurface }]} 
            />
            
            {isEditMode ? (
              <Animated.View style={{ 
                opacity: editModeAnim,
                transform: [{ scale: editModeAnim }]
              }}>
                <Appbar.Action 
                  icon="check" 
                  onPress={handleSaveEdit} 
                  disabled={isSaving || !editContent.trim()}
                  style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                  iconColor={theme.colors.onPrimary}
                />
              </Animated.View>
            ) : (
              <>
                <Appbar.Action 
                  icon={memo.is_pinned ? "pin" : "pin-outline"} 
                  onPress={handleTogglePinOnAppBar}
                  iconColor={memo.is_pinned ? theme.colors.primary : theme.colors.onSurface}
                />
                <Menu 
                  visible={menuVisible} 
                  onDismiss={() => setMenuVisible(false)} 
                  anchor={
                    <Appbar.Action 
                      icon="dots-vertical" 
                      onPress={() => setMenuVisible(true)} 
                    />
                  }
                  contentStyle={styles.menuContent}
                >
                  <Menu.Item 
                    onPress={handleEnterEditMode} 
                    title="편집" 
                    leadingIcon="pencil-outline"
                    titleStyle={{ fontWeight: '500' }}
                  />
                  <Divider style={{ marginVertical: 4 }}/>
                  <Menu.Item 
                    onPress={handleDeleteMemo} 
                    title="삭제" 
                    leadingIcon="delete-outline" 
                    titleStyle={[{ color: theme.colors.error, fontWeight: '500' }]} 
                  />
                </Menu>
              </>
            )}
          </Appbar.Header>
        </Surface>

        <Animated.View style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <ScrollView 
            style={styles.content} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 개선된 메모 카드 */}
            <Card style={[
              styles.memoCard, 
              { backgroundColor: cardBackgroundColor },
              // 커스텀 색상이 없을 때만 테두리 표시
              !hasCustomColor && { 
                borderColor: theme.colors.outline, 
                borderWidth: 1 
              },
              // 커스텀 색상이 있을 때 더 강한 그림자 효과
              hasCustomColor && styles.cardShadow
            ]} elevation={hasCustomColor ? 5 : 2}>
              <Card.Content style={styles.cardContent}>
                {isEditMode ? (
                  <Animated.View style={{
                    opacity: editModeAnim,
                    transform: [{ translateY: Animated.multiply(editModeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    }), 1) }]
                  }}>
                    {/* 편집 모드 UI */}
                    <View style={styles.editSection}>
                      <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>
                        메모 내용
                      </Text>
                      <Surface style={[styles.textInputSurface, { backgroundColor: textInputBackgroundColor }]} elevation={2}>
                        <TextInput
                          ref={contentInputRef}
                          value={editContent}
                          onChangeText={setEditContent}
                          placeholder="메모 내용을 입력하세요..."
                          mode="outlined"
                          multiline
                          style={[styles.textInput, { minHeight: Platform.OS === 'ios' ? 150 : 120 }]}
                          outlineColor="transparent"
                          activeOutlineColor={theme.colors.primary}
                          placeholderTextColor={finalCardContentColor + '99'}
                          theme={{ colors: { onSurfaceVariant: finalCardContentColor + 'AA' }}}
                          maxLength={1000}
                        />
                      </Surface>
                      <Text style={[styles.characterCount, { color: finalCardContentColor }]}>
                        {editContent.length}/1000
                      </Text>
                    </View>

                    <View style={styles.editSection}>
                      <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>
                        태그 ({editTags.length}/5)
                      </Text>
                      
                      <Surface style={[styles.tagEditContainer, { backgroundColor: textInputBackgroundColor }]} elevation={2}>
                        {editTags.map((tag) => {
                          const animValue = tagAnimations[tag] || new Animated.Value(1);
                          return (
                            <Animated.View
                              key={tag}
                              style={{
                                opacity: animValue,
                                transform: [{ scale: animValue }]
                              }}
                            >
                              <Chip 
                                mode="flat" 
                                onClose={() => handleRemoveTag(tag)} 
                                style={[styles.tagInInput, styles.animatedTag]} 
                                textStyle={styles.tagTextInInput} 
                                elevation={2}
                              >
                                {tag}
                              </Chip>
                            </Animated.View>
                          );
                        })}
                        <TextInput
                          value={tagInput}
                          onChangeText={setTagInput}
                          placeholder={editTags.length < 5 ? "태그 입력" : "최대 5개"}
                          style={styles.tagInput}
                          underlineColor="transparent"
                          activeUnderlineColor="transparent"
                          onSubmitEditing={handleAddTag}
                          editable={editTags.length < 5}
                          maxLength={20}
                        />
                      </Surface>
                      
                      {filteredSuggestedTags.length > 0 && editTags.length < 5 && (
                        <View style={styles.suggestedTagsSection}>
                          <Text style={[styles.suggestedTagsLabel, { color: finalCardContentColor }]}>
                            추천 태그
                          </Text>
                          <View style={styles.tagsWrapper}>
                            {filteredSuggestedTags.map((tag) => (
                              <TouchableOpacity
                                key={`suggest-${tag}`}
                                onPress={() => handleSelectSuggestedTag(tag)}
                                activeOpacity={0.7}
                              >
                                <Chip 
                                  mode="outlined" 
                                  style={[styles.suggestedTagChip, { borderColor: chipBorderColor + 'AA' }]}
                                  textStyle={{ fontSize: 12 }}
                                >
                                  {tag}
                                </Chip>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                ) : (
                  <>
                    {/* 읽기 모드 UI */}
                    <View style={styles.headerInfo}>
                      <Surface style={[
                        styles.priorityChip, 
                        { 
                          backgroundColor: hasCustomColor 
                            ? priorityDetail.color + '20'
                            : theme.colors.surfaceVariant
                        }
                      ]} elevation={1}>
                        <Chip 
                          icon={priorityDetail.icon} 
                          selectedColor={priorityDetail.color} 
                          mode="flat" 
                          style={{ backgroundColor: 'transparent' }}
                          textStyle={[
                            styles.priorityText, 
                            { 
                              color: hasCustomColor 
                                ? priorityDetail.color 
                                : theme.colors.onSurfaceVariant
                            }
                          ]}
                        >
                          우선순위: {priorityDetail.label}
                        </Chip>
                      </Surface>
                    </View>

                    {title && (
                      <Text variant="headlineSmall" style={[styles.memoTitle, { color: finalCardContentColor }]}>
                        {title}
                      </Text>
                    )}
                    
                    <TouchableOpacity 
                      activeOpacity={0.7} 
                      onPress={handleEnterEditMode} 
                      accessibilityLabel="메모 내용 터치 시 편집"
                      style={styles.contentTouchable}
                    >
                      <Surface 
                        style={[
                          styles.contentSurface,
                          {
                            backgroundColor: hasCustomColor 
                              ? (cardIsActuallyDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)')
                              : (theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                          }
                        ]} 
                        elevation={hasCustomColor ? 2 : 1}
                      >
                        <Text variant="bodyLarge" style={[styles.memoContent, { color: finalCardContentColor }]}>
                          {content || '내용이 없습니다. 탭하여 편집하세요.'}
                        </Text>
                      </Surface>
                    </TouchableOpacity>

                    {memo.tags && memo.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        <Text style={[styles.sectionTitle, { color: finalCardContentColor }]}>태그</Text>
                        <View style={styles.tagsWrapper}>
                          {memo.tags.map((tag, index) => (
                            <Animated.View
                              key={`${memo.id}-${tag}`}
                              style={{
                                opacity: fadeAnim,
                                transform: [{
                                  translateY: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0]
                                  })
                                }]
                              }}
                            >
                              <Surface elevation={2} style={styles.tagSurface}>
                                <Chip 
                                  mode="flat" 
                                  style={[styles.tag, { 
                                    backgroundColor: hasCustomColor 
                                      ? (cardIsActuallyDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                                      : (theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
                                  }]} 
                                  textStyle={[styles.tagText, { color: chipTextColor }]}
                                >
                                  {tag}
                                </Chip>
                              </Surface>
                            </Animated.View>
                          ))}
                        </View>
                      </View>
                    )}

                    <Surface style={[styles.metaInfo, { backgroundColor: 'transparent' }]} elevation={0}>
                      <View style={[styles.metaInfoContent, { borderTopColor: theme.colors.outlineVariant }]}>
                        <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>
                          생성일: {formatDateTime(memo.created_at)}
                        </Text>
                        {memo.updated_at !== memo.created_at && (
                          <Text style={[styles.metaText, { color: finalCardContentColor, opacity: 0.7 }]}>
                            수정일: {formatDateTime(memo.updated_at)}
                          </Text>
                        )}
                      </View>
                    </Surface>
                  </>
                )}
              </Card.Content>
            </Card>
            <View style={{ height: 60 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <Snackbar 
        visible={!!error} 
        onDismiss={() => dispatch(clearError())} 
        duration={4000} 
        action={{ label: '닫기', onPress: () => dispatch(clearError()) }} 
        style={[styles.snackbar, { backgroundColor: theme.colors.errorContainer }]}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>{error}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  keyboardContainer: { 
    flex: 1 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  
  // 앱바 스타일
  appbarSurface: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appbar: {
    elevation: 0,
  },
  appbarTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  saveButton: {
    borderRadius: 20,
    marginRight: 8,
  },
  menuContent: {
    borderRadius: 12,
    elevation: 8,
  },
  
  // 콘텐츠 컨테이너
  contentContainer: {
    flex: 1,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 16 
  },
  
  // 메모 카드
  memoCard: { 
    borderRadius: 24, 
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    // Android elevation shadow
    elevation: 8,
  },
  cardContent: { 
    paddingHorizontal: 24, 
    paddingVertical: 28 
  },
  
  // 헤더 정보
  headerInfo: { 
    marginBottom: 16, 
    alignItems: 'flex-start' 
  },
  priorityChip: {
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  priorityText: {
    fontWeight: '600',
    fontSize: 13,
  },
  
  // 메모 내용
  memoTitle: { 
    marginBottom: 20, 
    lineHeight: 34, 
    fontWeight: '700' 
  },
  contentTouchable: {
    marginBottom: 24,
  },
  contentSurface: {
    borderRadius: 16,
    padding: 16,
    // backgroundColor는 동적으로 설정됩니다
  },
  memoContent: { 
    lineHeight: 28, 
    fontSize: 17,
  },
  
  // 태그 관련
  tagsContainer: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 16, 
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  tagsWrapper: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  tagSurface: {
    borderRadius: 20,
  },
  tag: { 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  tagText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  
  // 메타 정보
  metaInfo: {
    marginTop: 8,
  },
  metaInfoContent: {
    borderTopWidth: 1, 
    paddingTop: 20, 
    gap: 8 
  },
  metaText: { 
    fontSize: 12, 
    opacity: 0.6,
    fontWeight: '500',
  },
  
  // 편집 모드 스타일
  editSection: { 
    marginBottom: 28 
  },
  textInputSurface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  textInput: { 
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  characterCount: { 
    alignSelf: 'flex-end', 
    fontSize: 12, 
    opacity: 0.7, 
    marginTop: 8,
    fontWeight: '500',
  },
  
  // 태그 입력
  tagEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
  },
  tagInInput: {
    margin: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  animatedTag: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tagTextInInput: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 12,
  },
  tagInput: {
    flex: 1,
    minWidth: 120,
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    fontSize: 14,
  },

  // 추천 태그
  suggestedTagsSection: { 
    marginTop: 24 
  },
  suggestedTagsLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 12, 
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  suggestedTagChip: { 
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
  },
  
  // 스낵바
  snackbar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});