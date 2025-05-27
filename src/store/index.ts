import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import memosReducer from './slices/memosSlice';

// 추후 슬라이스들을 추가할 예정
export const store = configureStore({
  reducer: {
    auth: authReducer,
    memos: memosReducer,
    // calendar: calendarReducer, // 추후 추가
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 