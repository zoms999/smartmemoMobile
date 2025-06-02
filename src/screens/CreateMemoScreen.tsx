import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  FlatList,
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
  RadioButton,
  Switch,
  IconButton,
  Menu,
  Divider,
  Portal,
  List,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, CreateMemoRequest, Category, Tag } from '../types';
import type { RootState, AppDispatch } from '../store';
import { newMemoService } from '../services/newMemoService';
import { createMemo, fetchMemos } from '../store/slices/memosSlice';

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
  '#F5F5F5', // 회색
];

const PRIORITY_OPTIONS = [
  { value: 0, label: '낮음', color: '#4CAF50', icon: 'arrow-down' },
  { value: 1, label: '보통', color: '#FF9800', icon: 'minus' },
  { value: 2, label: '높음', color: '#F44336', icon: 'arrow-up' },
];

export default function CreateMemoScreen() {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMO_COLORS[0]);
  const [priority, setPriority] = useState<number>(1);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isWidget, setIsWidget] = useState(false);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<CreateMemoScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);

  // 컴포넌트 마운트 시 카테고리 및 태그 목록 가져오기
  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  // 태그 입력 변화 감지하여 자동완성 제안
  useEffect(() => {
    if (tagInput.trim().length > 0) {
      searchTagSuggestions(tagInput.trim());
    } else {
      setSuggestedTags([]);
      setShowTagSuggestions(false);
    }
  }, [tagInput]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data, error } = await newMemoService.getCategories();
      if (error) {
        console.error('카테고리 로드 오류:', error);
        setSnackbarMessage('카테고리를 불러오는데 실패했습니다.');
        setShowSnackbar(true);
      } else if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('카테고리 로드 예외:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      // 1. 전체 태그 목록 로드 (자동완성용)
      const { data: allTags, error: allTagsError } = await newMemoService.getTags();
      if (allTagsError) {
        console.error('전체 태그 로드 오류:', allTagsError);
      } else if (allTags) {
        setAvailableTags(allTags);
        // 임시: RPC 함수 대신 처음 6개 태그를 인기 태그로 사용
        setPopularTags(allTags.slice(0, 6));
      }

      // TODO: RPC 함수 설정 후 아래 코드 활성화
      /*
      // 2. 인기 태그 로드 (RPC 함수 사용, 실패 시 일반 태그 사용)
      const { data: popular, error: popularError } = await newMemoService.getPopularTags(6);
      if (!popularError && popular) {
        setPopularTags(popular);
      } else if (allTags) {
        // RPC 실패 시 전체 태그에서 처음 6개 사용
        setPopularTags(allTags.slice(0, 6));
      }
      */
    } catch (error) {
      console.error('태그 로드 예외:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const searchTagSuggestions = async (query: string) => {
    try {
      const { data, error } = await newMemoService.searchTags(query);
      if (!error && data) {
        // 이미 선택된 태그는 제외
        const filteredSuggestions = data.filter(tag => 
          !tags.includes(tag.name)
        );
        setSuggestedTags(filteredSuggestions);
        setShowTagSuggestions(filteredSuggestions.length > 0);
      }
    } catch (error) {
      console.error('태그 검색 예외:', error);
    }
  };

  const handleAddTag = async (tagName?: string) => {
    const nameToAdd = tagName || tagInput.trim();
    
    if (!nameToAdd) return;
    
    if (tags.includes(nameToAdd)) {
      setSnackbarMessage('이미 추가된 태그입니다.');
      setShowSnackbar(true);
      return;
    }

    if (tags.length >= 5) {
      setSnackbarMessage('태그는 최대 5개까지 추가할 수 있습니다.');
      setShowSnackbar(true);
      return;
    }

    setTags([...tags, nameToAdd]);
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleSelectSuggestedTag = (tag: Tag) => {
    handleAddTag(tag.name);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddImage = () => {
    // TODO: 이미지 선택 기능 구현 (react-native-image-picker 등 사용)
    Alert.alert('이미지 추가', '이미지 추가 기능은 추후 구현 예정입니다.');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveMemo = async () => {
    if (!text.trim()) {
      setSnackbarMessage('메모 내용을 입력해주세요.');
      setShowSnackbar(true);
      return;
    }

    if (!user?.id) {
      setSnackbarMessage('로그인이 필요합니다.');
      setShowSnackbar(true);
      return;
    }

    setIsLoading(true);

    try {
      // 기존 newMemoService 방식으로 복원
      const memoData: CreateMemoRequest = {
        text: text.trim(),
        is_widget: isWidget,
        category_id: selectedCategory?.id,
        priority,
        tags,
        color: selectedColor,
        reminder: reminder?.toISOString(),
        images,
        user_id: user.id,
      };

      console.log('📝 newMemoService로 메모 생성:', memoData);
      
      const { data, error } = await newMemoService.createMemo(memoData);
      
      if (error) {
        console.error('❌ 메모 생성 오류:', error);
        setSnackbarMessage('메모 저장에 실패했습니다.');
        setShowSnackbar(true);
      } else {
        console.log('✅ 메모 생성 성공:', data);
        setSnackbarMessage('메모가 성공적으로 저장되었습니다!');
        setShowSnackbar(true);
        
        // 메모 목록 새로고침을 위해 Redux 액션 디스패치
        console.log('🔄 메모 목록 새로고침 요청');
        dispatch(fetchMemos(user.id));
        
        // 짧은 딜레이 후 뒤로 이동
        setTimeout(() => {
          navigation.goBack();
        }, 800);
      }
      
    } catch (error) {
      console.error('❌ 메모 생성 예외:', error);
      setSnackbarMessage('메모 저장 중 예상치 못한 오류가 발생했습니다.');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (text.trim() || tags.length > 0 || selectedCategory || reminder) {
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

  const handleDateSelection = () => {
    console.log('날짜 설정 버튼 클릭');
    
    Alert.alert(
      '📅 날짜 선택',
      '어떤 방식으로 날짜를 선택하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '📱 달력에서 선택',
          onPress: () => setShowDatePicker(true)
        },
        {
          text: '⚡ 빠른 선택',
          onPress: showQuickDateOptions
        }
      ]
    );
  };

  const showQuickDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    Alert.alert(
      '⚡ 빠른 날짜 선택',
      '언제 알림을 받으시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: `🕘 오늘 (${today.getMonth() + 1}월 ${today.getDate()}일)`,
          onPress: () => {
            const newDate = new Date(today);
            newDate.setHours(reminder?.getHours() || 9, reminder?.getMinutes() || 0, 0, 0);
            setReminder(newDate);
          }
        },
        {
          text: `🌅 내일 (${tomorrow.getMonth() + 1}월 ${tomorrow.getDate()}일)`,
          onPress: () => {
            const newDate = new Date(tomorrow);
            newDate.setHours(reminder?.getHours() || 9, reminder?.getMinutes() || 0, 0, 0);
            setReminder(newDate);
          }
        },
        {
          text: `📆 다음주 (${nextWeek.getMonth() + 1}월 ${nextWeek.getDate()}일)`,
          onPress: () => {
            const newDate = new Date(nextWeek);
            newDate.setHours(reminder?.getHours() || 9, reminder?.getMinutes() || 0, 0, 0);
            setReminder(newDate);
          }
        }
      ]
    );
  };

  const handleTimeSelection = () => {
    console.log('시간 설정 버튼 클릭');
    
    Alert.alert(
      '🕐 시간 선택',
      '어떤 방식으로 시간을 선택하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '🕐 시계에서 선택',
          onPress: () => setShowTimePicker(true)
        },
        {
          text: '⚡ 빠른 선택',
          onPress: showQuickTimeOptions
        }
      ]
    );
  };

  const showQuickTimeOptions = () => {
    Alert.alert(
      '⚡ 빠른 시간 선택',
      '몇 시에 알림을 받으시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '🌅 오전 8:00',
          onPress: () => setReminderTime(8, 0)
        },
        {
          text: '☀️ 오전 9:00',
          onPress: () => setReminderTime(9, 0)
        },
        {
          text: '🕛 오후 12:00',
          onPress: () => setReminderTime(12, 0)
        },
        {
          text: '🍽️ 오후 1:00',
          onPress: () => setReminderTime(13, 0)
        },
        {
          text: '🌆 오후 6:00',
          onPress: () => setReminderTime(18, 0)
        },
        {
          text: '🌙 오후 9:00',
          onPress: () => setReminderTime(21, 0)
        }
      ]
    );
  };

  const setReminderTime = (hours: number, minutes: number) => {
    const date = reminder || new Date();
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    setReminder(newDate);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('onDateChange 호출:', { event, selectedDate });
    setShowDatePicker(false);
    if (selectedDate) {
      if (reminder) {
        // 기존 시간 유지하고 날짜만 변경
        const newDate = new Date(selectedDate);
        newDate.setHours(reminder.getHours());
        newDate.setMinutes(reminder.getMinutes());
        console.log('기존 시간 유지한 새 날짜:', newDate);
        setReminder(newDate);
      } else {
        // 새로운 날짜 설정 (오늘 9시로 기본 설정)
        const newDate = new Date(selectedDate);
        newDate.setHours(9, 0, 0, 0);
        console.log('새 날짜 (9시):', newDate);
        setReminder(newDate);
      }
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('onTimeChange 호출:', { event, selectedTime });
    setShowTimePicker(false);
    if (selectedTime) {
      if (reminder) {
        // 기존 날짜 유지하고 시간만 변경
        const newTime = new Date(reminder);
        newTime.setHours(selectedTime.getHours());
        newTime.setMinutes(selectedTime.getMinutes());
        console.log('기존 날짜 유지한 새 시간:', newTime);
        setReminder(newTime);
      } else {
        // 날짜가 없으면 오늘 날짜에 선택한 시간 설정
        const today = new Date();
        today.setHours(selectedTime.getHours());
        today.setMinutes(selectedTime.getMinutes());
        today.setSeconds(0, 0);
        console.log('오늘 날짜에 선택한 시간:', today);
        setReminder(today);
      }
    }
  };

  const formatDateTime = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateStr = date.toLocaleDateString('ko-KR');
    const timeStr = date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    // 오늘, 내일 표시 개선
    if (date.toDateString() === today.toDateString()) {
      return `오늘 ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `내일 ${timeStr}`;
    } else {
      return `${dateStr} ${timeStr}`;
    }
  };

  const renderTagSuggestionItem = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestedTag(item)}
    >
      <Text variant="bodyMedium">{item.name}</Text>
      <IconButton icon="plus" size={16} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* 메모 내용 입력 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              메모 내용
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="메모를 입력하세요..."
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.textInput}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {text.length}/1000
            </Text>
          </Card.Content>
        </Card>

        {/* 카테고리 선택 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              카테고리
            </Text>
            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={{ marginLeft: 8 }}>카테고리 로딩 중...</Text>
              </View>
            ) : (
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => setCategoryMenuVisible(true)}
                  >
                    <View style={styles.categoryDisplay}>
                      {selectedCategory ? (
                        <>
                          <View 
                            style={[
                              styles.categoryColorDot, 
                              { backgroundColor: selectedCategory.color }
                            ]} 
                          />
                          <Text>{selectedCategory.name}</Text>
                        </>
                      ) : (
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                          카테고리 선택
                        </Text>
                      )}
                    </View>
                    <IconButton icon="chevron-down" size={20} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSelectedCategory(null);
                    setCategoryMenuVisible(false);
                  }}
                  title="카테고리 없음"
                />
                <Divider />
                {categories.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category);
                      setCategoryMenuVisible(false);
                    }}
                    title={category.name}
                    leadingIcon={() => (
                      <View 
                        style={[
                          styles.categoryColorDot, 
                          { backgroundColor: category.color }
                        ]} 
                      />
                    )}
                  />
                ))}
              </Menu>
            )}
          </Card.Content>
        </Card>

        {/* 우선순위 선택 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              우선순위
            </Text>
            <View style={styles.priorityContainer}>
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityItem,
                    priority === option.value && styles.priorityItemSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <IconButton 
                    icon={option.icon} 
                    iconColor={option.color} 
                    size={20}
                  />
                  <Text style={[
                    styles.priorityLabel,
                    priority === option.value && { color: option.color }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 색상 선택 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              메모 색상
            </Text>
            <View style={styles.colorContainer}>
              {MEMO_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <IconButton icon="check" iconColor="#333" size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 리마인더 설정 */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📅 리마인더
            </Text>
            <View style={styles.reminderContainer}>
              {reminder ? (
                <View style={styles.reminderDisplay}>
                  <View style={styles.reminderInfo}>
                    <Text variant="bodyMedium" style={styles.reminderText}>
                      🔔 {formatDateTime(reminder)}
                    </Text>
                    <Text variant="bodySmall" style={styles.reminderSubtext}>
                      설정된 시간에 알림을 받습니다
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setReminder(null)}
                    iconColor="#666"
                  />
                </View>
              ) : (
                <View style={styles.noReminderContainer}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    🔕 리마인더 없음
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    날짜와 시간을 설정하여 알림을 받으세요
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.reminderButtons}>
              <Button
                mode="contained"
                onPress={handleDateSelection}
                style={styles.reminderButton}
                icon="calendar"
              >
                날짜 선택
              </Button>
              <Button
                mode="contained"
                onPress={handleTimeSelection}
                style={styles.reminderButton}
                icon="clock"
              >
                시간 선택
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 태그 입력 (개선된 자동완성 기능) */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              태그 ({tags.length}/5)
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="태그를 입력하세요"
                mode="outlined"
                style={styles.tagInput}
                onSubmitEditing={() => handleAddTag()}
                maxLength={20}
                onFocus={() => {
                  if (suggestedTags.length > 0) {
                    setShowTagSuggestions(true);
                  }
                }}
              />
              <Button
                mode="contained"
                onPress={() => handleAddTag()}
                disabled={!tagInput.trim() || tags.length >= 5}
                style={styles.addTagButton}
              >
                추가
              </Button>
            </View>

            {/* 태그 자동완성 제안 */}
            {showTagSuggestions && suggestedTags.length > 0 && (
              <Card style={styles.suggestionsCard}>
                <Card.Content>
                  <Text variant="bodySmall" style={styles.suggestionsTitle}>
                    추천 태그
                  </Text>
                  <FlatList
                    data={suggestedTags}
                    renderItem={renderTagSuggestionItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.suggestionsList}
                    showsVerticalScrollIndicator={false}
                  />
                </Card.Content>
              </Card>
            )}
            
            {/* 선택된 태그들 */}
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

            {/* 인기 태그 표시 */}
            {tagsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={{ marginLeft: 8 }}>인기 태그 로딩 중...</Text>
              </View>
            ) : popularTags.length > 0 && (
              <View style={styles.popularTagsContainer}>
                <Text variant="bodySmall" style={styles.popularTagsTitle}>
                  자주 사용되는 태그
                </Text>
                <View style={styles.popularTagsRow}>
                  {popularTags.map((tag) => (
                    <Chip
                      key={tag.id}
                      mode="outlined"
                      onPress={() => {
                        if (!tags.includes(tag.name) && tags.length < 5) {
                          handleAddTag(tag.name);
                        }
                      }}
                      style={[
                        styles.popularTag,
                        tags.includes(tag.name) && styles.popularTagSelected
                      ]}
                      disabled={tags.includes(tag.name) || tags.length >= 5}
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 위젯 설정 */}
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text variant="titleMedium">위젯으로 표시</Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  홈 화면에서 바로 확인할 수 있습니다
                </Text>
              </View>
              <Switch
                value={isWidget}
                onValueChange={setIsWidget}
              />
            </View>
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
                <View style={styles.previewHeader}>
                  {selectedCategory && (
                    <View style={styles.previewCategory}>
                      <View 
                        style={[
                          styles.categoryColorDot, 
                          { backgroundColor: selectedCategory.color }
                        ]} 
                      />
                      <Text variant="bodySmall">{selectedCategory.name}</Text>
                    </View>
                  )}
                  <View style={styles.previewPriority}>
                    <IconButton
                      icon={PRIORITY_OPTIONS[priority].icon}
                      iconColor={PRIORITY_OPTIONS[priority].color}
                      size={16}
                    />
                  </View>
                </View>
                
                <Text variant="bodyMedium" style={styles.previewContent}>
                  {text || '메모 내용이 여기에 표시됩니다...'}
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
                
                {reminder && (
                  <View style={styles.previewReminder}>
                    <IconButton icon="bell" size={16} />
                    <Text variant="bodySmall">
                      {formatDateTime(reminder)}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 날짜/시간 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={reminder || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'default' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={reminder || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'default' : 'default'}
          onChange={onTimeChange}
          is24Hour={false}
        />
      )}

      {/* 로딩 오버레이 */}
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100, // 추가 여백으로 스크롤 영역 확보
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
    opacity: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  priorityItemSelected: {
    borderWidth: 2,
    backgroundColor: '#F5F5F5',
  },
  priorityLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333',
  },
  reminderContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  reminderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
  },
  reminderInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  reminderText: {
    fontWeight: 'bold',
  },
  reminderSubtext: {
    opacity: 0.7,
    marginTop: 2,
  },
  reminderButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  reminderButton: {
    flex: 1,
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
  suggestionsCard: {
    marginTop: 8,
    backgroundColor: '#F8F9FA',
  },
  suggestionsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  suggestionsList: {
    maxHeight: 120,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: 'white',
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
  popularTagsContainer: {
    marginTop: 16,
  },
  popularTagsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  popularTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  popularTag: {
    marginBottom: 4,
  },
  popularTagSelected: {
    opacity: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    marginTop: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewPriority: {
    marginRight: -8,
  },
  previewContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  previewTag: {
    height: 24,
  },
  previewReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
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
  noReminderContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
}); 