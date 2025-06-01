import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Linking, Alert } from 'react-native';
import { Text, Appbar, Card, useTheme, Button, ActivityIndicator, List, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Application from 'expo-application';

// For expo-updates (managed workflow)
// import * as Updates from 'expo-updates';

// --- Mock Update Check Service ---
// In a real app, this would fetch from your server or use a library
const MOCK_SERVER_LATEST_VERSION = '1.0.1'; // Simulate a newer version
const MOCK_APP_STORE_URL_IOS = 'https://apps.apple.com/app/your-app-id'; // Replace with your App Store link
const MOCK_PLAY_STORE_URL_ANDROID = 'https://play.google.com/store/apps/details?id=your.package.name'; // Replace

const checkAppUpdate = async (currentVersion: string): Promise<{ hasUpdate: boolean; latestVersion?: string; storeUrl?: string }> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate API call
      const latestVersionFromServer = MOCK_SERVER_LATEST_VERSION;
      const hasUpdate = latestVersionFromServer.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;
      let storeUrl;
      if (hasUpdate) {
        storeUrl = Platform.OS === 'ios' ? MOCK_APP_STORE_URL_IOS : MOCK_PLAY_STORE_URL_ANDROID;
      }
      resolve({ hasUpdate, latestVersion: latestVersionFromServer, storeUrl });
    }, 1500); // Simulate network delay
  });
};

export default function AppInfoScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [storeLink, setStoreLink] = useState<string | null>(null);

  useEffect(() => {
    setAppVersion(Application.nativeApplicationVersion || 'N/A');
  }, []);

  const handleCheckForUpdate = async () => {
    if (!appVersion || appVersion === 'N/A') {
      Alert.alert("오류", "앱 버전을 가져올 수 없습니다.");
      return;
    }

    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    setStoreLink(null);

    // Managed Expo Updates (Example - uncomment and configure if using expo-updates)
    /* try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateMessage(`새로운 버전 (${update.manifest?.version || 'Unknown'})이 있습니다. 다운로드 하시겠습니까?`);
        // Option to download update: await Updates.fetchUpdateAsync();
        // await Updates.reloadAsync();
        Alert.alert(
          "업데이트 가능",
          `새로운 버전 (${update.manifest?.version})을 다운로드하고 앱을 다시 시작하시겠습니까?`,
          [
            { text: "나중에", style: "cancel" },
            { text: "지금 업데이트", onPress: async () => {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }}
          ]
        );
      } else {
        setUpdateMessage("현재 최신 버전을 사용하고 있습니다.");
      }
    } catch (e) {
      console.error("Failed to check for updates:", e);
      setUpdateMessage("업데이트 확인 중 오류가 발생했습니다.");
    } */

    // Custom/Mock update check
    try {
      const { hasUpdate, latestVersion, storeUrl } = await checkAppUpdate(appVersion);
      if (hasUpdate && latestVersion) {
        setUpdateMessage(`새로운 버전 (${latestVersion})이 있습니다!`);
        if (storeUrl) setStoreLink(storeUrl);
      } else {
        setUpdateMessage("현재 최신 버전을 사용하고 있습니다.");
      }
    } catch (error) {
      console.error("Update check error:", error);
      setUpdateMessage("업데이트 확인 중 오류가 발생했습니다.");
    }

    setIsCheckingUpdate(false);
  };

  const openStorePage = async () => {
    if (storeLink) {
      const supported = await Linking.canOpenURL(storeLink);
      if (supported) {
        await Linking.openURL(storeLink);
      } else {
        Alert.alert("오류", "스토어를 열 수 없습니다.");
      }
    }
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="앱 정보" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="앱 이름"
              description="Sticker Memo"
              titleStyle={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="sticker-text-outline" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="현재 버전"
              description={appVersion || '확인 중...'}
              titleStyle={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="cellphone-information" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="개발자"
              description="Your Name / Company" // Replace with your info
              titleStyle={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="account-circle-outline" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 16, marginBottom: 32 }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface, marginBottom: 8 }]}>
              앱 업데이트
            </Text>
            {isCheckingUpdate ? (
              <View style={styles.centered}>
                <ActivityIndicator animating={true} color={theme.colors.primary} style={{ marginBottom: 8 }} />
                <Text style={{ color: theme.colors.onSurfaceVariant }}>업데이트 확인 중...</Text>
              </View>
            ) : (
              <>
                {updateMessage && (
                  <Text style={[styles.updateMessage, { color: storeLink ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
                    {updateMessage}
                  </Text>
                )}
                {storeLink && (
                  <Button mode="contained" icon="storefront-outline" onPress={openStorePage} style={{ marginTop: 12 }} >
                    스토어에서 업데이트
                  </Button>
                )}
                <Button mode="outlined" icon="sync" onPress={handleCheckForUpdate} style={{ marginTop: 16 }} disabled={isCheckingUpdate} >
                  업데이트 확인
                </Button>
              </>
            )}
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
    fontWeight: 'bold',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  updateMessage: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
  }
});