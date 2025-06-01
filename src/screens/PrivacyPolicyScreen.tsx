import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Appbar, Card, useTheme, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const PRIVACY_POLICY_SECTIONS = [
  {
    title: '1. 수집하는 개인정보의 항목',
    content: 'Sticker Memo 앱은 서비스 제공을 위해 다음과 같은 최소한의 개인정보를 수집합니다.\n- 필수항목: 이메일 주소 (계정 생성 및 식별용), 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보\n- 선택항목: (구현 시 명시, 예: 프로필 이름, 프로필 사진 등)',
  },
  {
    title: '2. 개인정보의 수집 및 이용목적',
    content: '수집한 개인정보는 다음의 목적을 위해 활용됩니다.\n- 회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 불만처리 등 민원처리, 고지사항 전달\n- 서비스 제공: 콘텐츠 제공, 맞춤 서비스 제공, 기능 개선\n- 신규 서비스 개발 및 마케팅/광고에의 활용 (동의 시): 신규 서비스 개발 및 맞춤 서비스 제공, 통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악, 회원의 서비스 이용에 대한 통계',
  },
  {
    title: '3. 개인정보의 보유 및 이용기간',
    content: '회원님의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.\n- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래등에서의 소비자보호에 관한 법률)\n- 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래등에서의 소비자보호에 관한 법률)\n- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래등에서의 소비자보호에 관한 법률)\n- 서비스 이용 관련 개인정보(로그인 기록): 3개월 (통신비밀보호법)',
  },
  {
    title: '4. 개인정보의 파기절차 및 방법',
    content: '회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.\n- 파기절차: 회원님이 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다. 별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 보유되는 이외의 다른 목적으로 이용되지 않습니다.\n- 파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.',
  },
  {
    title: '5. 개인정보 제공',
    content: '회사는 이용자들의 개인정보를 "2. 개인정보의 수집목적 및 이용목적"에서 고지한 범위 내에서 사용하며, 이용자의 사전 동의 없이는 동 범위를 초과하여 이용하거나 원칙적으로 이용자의 개인정보를 외부에 공개하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.\n- 이용자들이 사전에 공개에 동의한 경우\n- 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
  },
  {
    title: '6. 개인정보처리방침 변경',
    content: '현 개인정보처리방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일전부터 홈페이지의 공지사항을 통하여 고지할 것입니다.',
  },
  {
    title: '7. 개인정보에 관한 민원서비스',
    content: '회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보관리책임자를 지정하고 있습니다.\n- 개인정보보호 책임자: 홍길동\n- 이메일: privacy@stickermemo.app (예시)\n- 최종 업데이트: 2024년 7월 27일',
  },
];

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="개인정보 처리방침" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginBottom: 32 }]}>
          <Card.Content>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Sticker Memo (이하 "회사")는 귀하의 개인정보를 매우 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 귀하께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </Text>
            {PRIVACY_POLICY_SECTIONS.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  {section.title}
                </Text>
                <Text variant="bodyMedium" style={[styles.sectionContent, { color: theme.colors.onSurfaceVariant }]}>
                  {section.content}
                </Text>
                {index < PRIVACY_POLICY_SECTIONS.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    lineHeight: 22,
  },
  divider: {
    marginTop: 20,
  },
});