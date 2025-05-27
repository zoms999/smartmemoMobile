import { MMKV } from 'react-native-mmkv';

// MMKV 인스턴스 생성
export const storage = new MMKV({
  id: 'sticker-memo-app',
  encryptionKey: 'sticker-memo-encryption-key', // 실제 운영에서는 더 안전한 키 사용
});

// 스토리지 키 상수
export const STORAGE_KEYS = {
  // 인증 관련
  AUTH_TOKEN: 'auth_token',
  USER_SESSION: 'user_session',
  
  // 앱 설정
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  NOTIFICATION_SETTINGS: 'notification_settings',
  
  // 캐시 데이터
  MEMOS_CACHE: 'memos_cache',
  EVENTS_CACHE: 'events_cache',
  
  // 동기화 관련
  OFFLINE_QUEUE: 'offline_queue',
  LAST_SYNC_TIME: 'last_sync_time',
} as const;

// 타입 안전한 스토리지 헬퍼 함수들
export const storageHelpers = {
  // 문자열 저장/읽기
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },
  
  getString: (key: string, defaultValue?: string): string | undefined => {
    return storage.getString(key) ?? defaultValue;
  },
  
  // 객체 저장/읽기 (JSON 직렬화)
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
  
  getObject: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const jsonString = storage.getString(key);
      return jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (error) {
      console.error(`스토리지에서 객체 읽기 실패 (${key}):`, error);
      return defaultValue;
    }
  },
  
  // 불린 저장/읽기
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },
  
  getBoolean: (key: string, defaultValue?: boolean): boolean | undefined => {
    return storage.getBoolean(key) ?? defaultValue;
  },
  
  // 숫자 저장/읽기
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },
  
  getNumber: (key: string, defaultValue?: number): number | undefined => {
    return storage.getNumber(key) ?? defaultValue;
  },
  
  // 키 삭제
  delete: (key: string): void => {
    storage.delete(key);
  },
  
  // 키 존재 여부 확인
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
  
  // 모든 키 가져오기
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
  
  // 스토리지 초기화
  clearAll: (): void => {
    storage.clearAll();
  },
};

// 특정 도메인별 스토리지 헬퍼
export const authStorage = {
  setToken: (token: string) => storageHelpers.setString(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => storageHelpers.getString(STORAGE_KEYS.AUTH_TOKEN),
  clearToken: () => storageHelpers.delete(STORAGE_KEYS.AUTH_TOKEN),
  
  setUserSession: (session: object) => storageHelpers.setObject(STORAGE_KEYS.USER_SESSION, session),
  getUserSession: () => storageHelpers.getObject(STORAGE_KEYS.USER_SESSION),
  clearUserSession: () => storageHelpers.delete(STORAGE_KEYS.USER_SESSION),
};

export const settingsStorage = {
  setThemeMode: (mode: 'light' | 'dark' | 'system') => 
    storageHelpers.setString(STORAGE_KEYS.THEME_MODE, mode),
  getThemeMode: () => 
    storageHelpers.getString(STORAGE_KEYS.THEME_MODE, 'system') as 'light' | 'dark' | 'system',
  
  setLanguage: (language: string) => 
    storageHelpers.setString(STORAGE_KEYS.LANGUAGE, language),
  getLanguage: () => 
    storageHelpers.getString(STORAGE_KEYS.LANGUAGE, 'ko'),
}; 