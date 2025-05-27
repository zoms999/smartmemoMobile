import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Button,
  useTheme,
} from 'react-native-paper';

// 임시 일정 데이터
const mockEvents = [
  {
    id: '1',
    title: '팀 회의',
    description: '주간 진행 상황 공유',
    start_date: '2024-01-15T14:00:00Z',
    end_date: '2024-01-15T15:00:00Z',
    color: '#6366F1',
  },
  {
    id: '2',
    title: '의사 약속',
    description: '정기 검진',
    start_date: '2024-01-16T10:30:00Z',
    end_date: '2024-01-16T11:30:00Z',
    color: '#EC4899',
  },
  {
    id: '3',
    title: '친구 만남',
    description: '저녁 식사',
    start_date: '2024-01-17T19:00:00Z',
    end_date: '2024-01-17T21:00:00Z',
    color: '#10B981',
  },
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const theme = useTheme();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const todayEvents = mockEvents.filter(event => {
    const eventDate = new Date(event.start_date).toISOString().split('T')[0];
    return eventDate === selectedDate;
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 간단한 날짜 선택 영역 */}
        <Card style={styles.dateCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.dateTitle}>
              {formatDate(selectedDate + 'T00:00:00Z')}
            </Text>
            <Text variant="bodyMedium" style={styles.dateSubtitle}>
              {todayEvents.length}개의 일정
            </Text>
          </Card.Content>
        </Card>

        {/* 일정 목록 */}
        <View style={styles.eventsContainer}>
          {todayEvents.length > 0 ? (
            todayEvents.map((event) => (
              <Card
                key={event.id}
                style={[styles.eventCard, { borderLeftColor: event.color }]}
                onPress={() => console.log('Navigate to event detail:', event.id)}
              >
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <Text variant="titleMedium" style={styles.eventTitle}>
                      {event.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.eventTime}>
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </Text>
                  </View>
                  {event.description && (
                    <Text variant="bodyMedium" style={styles.eventDescription}>
                      {event.description}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  오늘 일정이 없습니다
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => console.log('Create new event')}
                  style={styles.createButton}
                >
                  일정 추가
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* 다가오는 일정 미리보기 */}
        <Card style={styles.upcomingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.upcomingTitle}>
              다가오는 일정
            </Text>
            {mockEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.upcomingEvent}>
                <View
                  style={[styles.eventColorDot, { backgroundColor: event.color }]}
                />
                <View style={styles.upcomingEventContent}>
                  <Text variant="bodyMedium">{event.title}</Text>
                  <Text variant="bodySmall" style={styles.upcomingEventDate}>
                    {formatDate(event.start_date)} {formatTime(event.start_date)}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Create new event')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  dateCard: {
    margin: 16,
    marginBottom: 8,
  },
  dateTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateSubtitle: {
    opacity: 0.7,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  eventCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  eventTime: {
    opacity: 0.7,
  },
  eventDescription: {
    opacity: 0.8,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  createButton: {
    marginTop: 8,
  },
  upcomingCard: {
    margin: 16,
    marginTop: 8,
  },
  upcomingTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  upcomingEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  upcomingEventContent: {
    flex: 1,
  },
  upcomingEventDate: {
    opacity: 0.6,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 