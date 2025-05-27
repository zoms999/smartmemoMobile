import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import { storage } from '../services/storage';

// Redux Persist 설정
const persistConfig = {
  key: 'root',
  storage: {
    setItem: (key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    },
    getItem: (key: string) => {
      const value = storage.getString(key);
      return Promise.resolve(value || null);
    },
    removeItem: (key: string) => {
      storage.delete(key);
      return Promise.resolve();
    },
  },
  whitelist: ['auth', 'settings'], // 영구 저장할 slice들
};

// 루트 리듀서 (추후 각 feature slice들이 추가될 예정)
const rootReducer = combineReducers({
  // 추후 추가될 슬라이스들:
  // auth: authSlice.reducer,
  // memo: memoSlice.reducer,
  // calendar: calendarSlice.reducer,
  // settings: settingsSlice.reducer,
  // sync: syncSlice.reducer,
});

// Persist된 리듀서 생성
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 스토어 설정
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor 생성
export const persistor = persistStore(store);

// RTK Query 리스너 설정 (캐싱, 재요청 등을 위해)
setupListeners(store.dispatch);

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 