import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  useTheme,
  IconButton, // IconButton은 개별 카드 삭제 버튼이나 즐겨찾기 버튼에 사용될 수 있으므로 import는 유지합니다.
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lotteryService } from '../services/lotteryService';
import type { LotteryNumbers } from '../types';

const LotteryScreen: React.FC = () => {
  const theme = useTheme();
  const [generatedNumbers, setGeneratedNumbers] = useState<LotteryNumbers[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // AI 로또 번호 생성 로직 (가중치 기반)
  const generateAILotteryNumbers = (): number[] => {
    const numbers: number[] = [];
    
    // 통계적으로 자주 나오는 번호들에 가중치 부여
    const frequentNumbers = [1, 2, 3, 7, 17, 21, 27, 31, 34, 40];
    const weights: { [key: number]: number } = {};
    
    // 모든 번호에 기본 가중치 1 부여
    for (let i = 1; i <= 45; i++) {
      weights[i] = 1;
    }
    
    // 자주 나오는 번호들에 추가 가중치
    frequentNumbers.forEach(num => {
      weights[num] = 1.5;
    });
    
    // 최근 회차 패턴 고려 (연속 번호, 끝자리 패턴 등)
    const avoidConsecutive = Math.random() > 0.3; // 70% 확률로 연속 번호 피하기
    
    while (numbers.length < 6) {
      // 가중치 기반 번호 선택
      const weightedNumbers: number[] = [];
      for (let num = 1; num <= 45; num++) {
        if (!numbers.includes(num)) {
          const weight = Math.floor(weights[num] * 10);
          for (let w = 0; w < weight; w++) {
            weightedNumbers.push(num);
          }
        }
      }
      
      const randomIndex = Math.floor(Math.random() * weightedNumbers.length);
      const selectedNumber = weightedNumbers[randomIndex];
      
      // 연속 번호 체크
      if (avoidConsecutive && numbers.length > 0) {
        const hasConsecutive = numbers.some(num => 
          Math.abs(num - selectedNumber) === 1
        );
        if (hasConsecutive && Math.random() > 0.2) {
          continue; // 80% 확률로 연속 번호 스킵
        }
      }
      
      numbers.push(selectedNumber);
    }
    
    return numbers.sort((a, b) => a - b);
  };

  // 데이터베이스에서 로또 번호 불러오기
  const loadLotteryNumbers = async () => {
    try {
      setIsLoading(true);
      const data = await lotteryService.getLotteryNumbers();
      setGeneratedNumbers(data);
    } catch (error) {
      console.error('로또 번호 불러오기 오류:', error);
      setSnackbarMessage('로또 번호를 불러오는데 실패했습니다.');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLotteryNumbers();
  }, []);

  const generateNumbers = async () => {
    setIsGenerating(true);
    
    try {
      // AI 생성 시뮬레이션 (로딩 효과)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const numbers = generateAILotteryNumbers();
      
      // 데이터베이스에 저장
      const savedLottery = await lotteryService.createLotteryNumbers({
        numbers,
        generation_method: 'AI',
        is_favorite: false,
        notes: 'AI가 생성한 번호',
      });
      
      // 로컬 상태 업데이트
      setGeneratedNumbers(prev => [savedLottery, ...prev]);
      setSnackbarMessage('AI 번호가 생성되어 저장되었습니다!');
      setSnackbarVisible(true);
      
    } catch (error) {
      console.error('번호 생성 오류:', error);
      setSnackbarMessage('번호 생성에 실패했습니다.');
      setSnackbarVisible(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // clearHistory 함수는 남아있지만, UI에서 호출하는 버튼은 제거됩니다.
  // 필요하다면 이 함수도 제거할 수 있습니다.
  const clearHistory = () => {
    Alert.alert(
      '히스토리 삭제',
      '모든 생성된 번호를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('전체 삭제 시작, 총 개수:', generatedNumbers.length);
              // 모든 번호를 하나씩 삭제
              for (const lottery of generatedNumbers) {
                if (lottery.id) {
                  await lotteryService.deleteLotteryNumbers(lottery.id);
                }
              }
              setGeneratedNumbers([]);
              setSnackbarMessage('모든 로또 번호가 삭제되었습니다.');
              setSnackbarVisible(true);
              console.log('전체 삭제 완료');
            } catch (error) {
              console.error('전체 삭제 오류:', error);
              setSnackbarMessage(`삭제에 실패했습니다: ${error.message}`);
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (id: number, currentFavorite: boolean) => {
    try {
      await lotteryService.toggleFavorite(id, !currentFavorite);
      setGeneratedNumbers(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_favorite: !currentFavorite } : item
        )
      );
      setSnackbarMessage(currentFavorite ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
      setSnackbarMessage('즐겨찾기 설정에 실패했습니다.');
      setSnackbarVisible(true);
    }
  };

  // 로또 번호 삭제
  const deleteLotteryNumber = async (id: number) => {
    console.log('=== deleteLotteryNumber 함수 시작 ===');
    console.log('삭제할 ID:', id);
    console.log('현재 generatedNumbers 배열:', generatedNumbers);
    
    try {
      console.log('1. DB 삭제 요청 시작...');
      await lotteryService.deleteLotteryNumbers(id);
      console.log('2. DB 삭제 완료');
      
      console.log('3. 로컬 상태 업데이트 시작...');
      setGeneratedNumbers(prev => {
        console.log('3-1. 이전 상태:', prev);
        const filtered = prev.filter(item => {
          const shouldKeep = item.id !== id;
          console.log(`아이템 ID: ${item.id}, 삭제 대상 ID: ${id}, 유지여부: ${shouldKeep}`);
          return shouldKeep;
        });
        console.log('3-2. 필터링 후 결과:', filtered);
        console.log('3-3. 삭제 전 개수:', prev.length, '삭제 후 개수:', filtered.length);
        return filtered;
      });
      
      console.log('4. 스낵바 메시지 표시');
      setSnackbarMessage('로또 번호가 삭제되었습니다.');
      setSnackbarVisible(true);
      console.log('=== 삭제 작업 완료 ===');
    } catch (error) {
      console.error('=== 삭제 오류 발생 ===');
      console.error('오류 객체:', error);
      console.error('오류 메시지:', error?.message);
      setSnackbarMessage(`삭제에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
      setSnackbarVisible(true);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Icon name="dice-multiple" size={40} color={theme.colors.primary} />
        <Title style={{ color: theme.colors.onSurface, marginTop: 8 }}>
          AI 로또 생성기
        </Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          인공지능이 통계 분석을 통해 최적의 로또 번호를 생성합니다
        </Paragraph>
      </Surface>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={generateNumbers}
          loading={isGenerating}
          disabled={isGenerating}
          icon="auto-fix"
          style={styles.generateButton}
          contentStyle={styles.generateButtonContent}
        >
          {isGenerating ? 'AI 분석 중...' : 'AI 번호 생성'}
        </Button>

        {/* 테스트용 버튼들 */}
        {/* <View style={styles.testButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              console.log('=== 테스트 버튼 클릭됨 ===');
              console.log('현재 generatedNumbers:', generatedNumbers);
              setSnackbarMessage('테스트 버튼이 작동합니다!');
              setSnackbarVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            테스트
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => {
              console.log('=== 콘솔 로그 테스트 ===');
              console.log('generatedNumbers 개수:', generatedNumbers.length);
              generatedNumbers.forEach((item, index) => {
                console.log(`${index + 1}. ID: ${item.id}, 번호: ${item.numbers}`);
              });
            }}
            buttonColor={theme.colors.secondaryContainer}
          >
            로그 확인
          </Button>
        </View> */}

        {generatedNumbers.length > 0 && (
          <View style={styles.historyHeader}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
              생성된 번호
            </Text>
            {/* 아래 IconButton (쓰레기통 모양 전체 삭제 버튼) 제거됨 */}
            {/* 
            <IconButton
              icon="delete"
              size={20}
              onPress={clearHistory}
              iconColor={theme.colors.error}
            /> 
            */}
          </View>
        )}

        {generatedNumbers.map((lottery, index) => (
          <Card key={lottery.id || `lottery-${index}`} style={[styles.numberCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    #{generatedNumbers.length - index} {lottery.generation_method === 'AI' && '🤖'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(lottery.created_at)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <IconButton
                    icon={lottery.is_favorite ? 'heart' : 'heart-outline'}
                    size={24}
                    onPress={() => {
                      console.log('즐겨찾기 버튼 클릭, ID:', lottery.id);
                      if (lottery.id) {
                        toggleFavorite(lottery.id, lottery.is_favorite);
                      } else {
                        console.log('lottery.id가 없습니다:', lottery);
                        setSnackbarMessage('이 번호는 즐겨찾기 설정을 할 수 없습니다.');
                        setSnackbarVisible(true);
                      }
                    }}
                    iconColor={lottery.is_favorite ? theme.colors.error : theme.colors.onSurfaceVariant}
                    style={{
                      margin: 2,
                    }}
                  />
                  <Button // 개별 항목 삭제 버튼은 유지합니다.
                    mode="outlined"
                    compact
                    onPress={() => {
                      console.log('=== 삭제 버튼 클릭됨 ===');
                      console.log('lottery 객체:', lottery);
                      console.log('lottery.id:', lottery.id);
                      
                      if (lottery.id) {
                        console.log('ID가 있음, 삭제 실행');
                        deleteLotteryNumber(lottery.id);
                      } else {
                        console.log('ID가 없음, 에러 메시지 표시');
                        setSnackbarMessage('이 번호는 삭제할 수 없습니다. (ID 없음)');
                        setSnackbarVisible(true);
                      }
                    }}
                    buttonColor={theme.colors.errorContainer}
                    textColor={theme.colors.error}
                    style={{
                      minWidth: 60,
                      marginLeft: 8,
                    }}
                  >
                    삭제
                  </Button>
                </View>
              </View>
              
              <View style={styles.numbersContainer}>
                {lottery.numbers.map((number, numIndex) => (
                  <Chip
                    key={numIndex}
                    style={[
                      styles.numberChip,
                      {
                        backgroundColor: theme.colors.primaryContainer,
                      }
                    ]}
                    textStyle={[
                      styles.numberText,
                      { color: theme.colors.onPrimaryContainer }
                    ]}
                  >
                    {number}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}

        {generatedNumbers.length === 0 && (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="lightbulb-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
                AI 번호 생성하기
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                버튼을 눌러 AI가 분석한 최적의 로또 번호를 생성해보세요
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: '닫기',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  generateButton: {
    marginBottom: 24,
  },
  generateButtonContent: {
    paddingVertical: 8,
  },
  testButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 이 부분은 그대로 두거나, 버튼이 없으므로 flex-start로 변경해도 무방합니다.
    alignItems: 'center',
    marginBottom: 16,
  },
  numberCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberChip: {
    minWidth: 40,
  },
  numberText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyCard: {
    marginTop: 40,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});

export default LotteryScreen;