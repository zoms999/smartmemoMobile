// screens/HelpScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, Linking, Alert } from 'react-native'; // Added View, Linking, Alert
import { Text, Appbar, Card, useTheme, Button, Divider } from 'react-native-paper'; // Added Button
import { useNavigation } from '@react-navigation/native';

const FAQ_DATA = [
  {
    question: 'Q. 메모는 어떻게 만드나요?',
    answer: 'A. 홈 화면 우측 하단의 (+) 버튼을 눌러 새 메모를 작성할 수 있습니다. 제목, 내용, 태그, 우선순위 등을 설정하고 저장하세요.',
  },
  {
    question: 'Q. 메모를 편집하거나 삭제하려면 어떻게 하나요?',
    answer: 'A. 메모 목록에서 원하는 메모를 선택하여 상세 화면으로 이동한 후, 우측 상단 메뉴(...)를 통해 편집 또는 삭제할 수 있습니다.',
  },
  {
    question: 'Q. 다크 모드는 어떻게 변경하나요?',
    answer: 'A. 프로필 화면 > 앱 설정에서 "다크 모드" 스위치를 사용하여 테마를 변경할 수 있습니다.',
  },
  {
    question: 'Q. 데이터는 안전하게 보관되나요?',
    answer: 'A. 네, 귀하의 데이터는 Supabase 클라우드에 안전하게 암호화되어 저장됩니다. 정기적인 백업도 이루어지고 있습니다.',
  },
  {
    question: 'Q. 비밀번호를 잊어버렸어요.',
    answer: 'A. 로그인 화면에서 "비밀번호 찾기" 옵션을 통해 가입 시 사용한 이메일로 비밀번호 재설정 링크를 받을 수 있습니다.',
  },
  {
    question: 'Q. 고객 지원팀에 어떻게 연락하나요?',
    answer: 'A. 문제가 지속되거나 추가 지원이 필요한 경우, [support@stickermemo.app](mailto:support@stickermemo.app) (예시 이메일)으로 문의해주세요.',
  },
];

export default function HelpScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  const handleEmailLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("오류", "이메일 앱을 열 수 없습니다. 다음 주소로 문의해주세요: " + url.replace('mailto:', ''));
    }
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="도움말 및 FAQ" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              자주 묻는 질문 (FAQ)
            </Text>
            {FAQ_DATA.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <Text variant="titleMedium" style={[styles.question, { color: theme.colors.primary }]}>
                  {item.question}
                </Text>
                <Text variant="bodyMedium" style={[styles.answer, { color: theme.colors.onSurfaceVariant }]}>
                  {item.answer.includes('mailto:') ? (
                     item.answer.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
                        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        if (match) {
                          return (
                            <Text
                              key={i}
                              style={{ color: theme.colors.tertiary, textDecorationLine: 'underline' }}
                              onPress={() => handleEmailLink(match[2])}
                            >
                              {match[1]}
                            </Text>
                          );
                        }
                        return part;
                      })
                  ) : item.answer}
                </Text>
                {index < FAQ_DATA.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 16, marginBottom: 32 }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              추가 지원
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22, marginBottom: 16 }}>
              위에 없는 질문이나 다른 문제가 있으신가요? 언제든지 저희에게 연락주세요.
            </Text>
            <Button
              mode="contained"
              icon="email-outline"
              onPress={() => handleEmailLink('mailto:support@stickermemo.app')} // Replace with your actual support email
            >
              고객 지원팀에 문의하기
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    lineHeight: 22,
  },
  divider: {
    marginTop: 16, // Apply margin top to the divider itself for consistent spacing
  },
});