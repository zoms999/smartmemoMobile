import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { StickerMemo, MemosState } from '../../types';
import { memoService } from '../../services/memoService';

// 초기 상태
const initialState: MemosState = {
  memos: [],
  selectedMemo: null,
  isLoading: false,
  error: null,
};

// 비동기 액션들
export const fetchMemos = createAsyncThunk(
  'memos/fetchMemos',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await memoService.getMemos(userId);
      if (error) {
        return rejectWithValue(error.message);
      }
      return data || [];
    } catch (error) {
      return rejectWithValue('메모를 불러오는 중 오류가 발생했습니다.');
    }
  }
);

export const createMemo = createAsyncThunk(
  'memos/createMemo',
  async (memo: Omit<StickerMemo, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await memoService.createMemo(memo);
      if (error) {
        return rejectWithValue(error.message);
      }
      return data;
    } catch (error) {
      return rejectWithValue('메모 생성 중 오류가 발생했습니다.');
    }
  }
);

export const updateMemo = createAsyncThunk(
  'memos/updateMemo',
  async ({ id, updates }: { id: string; updates: Partial<StickerMemo> }, { rejectWithValue }) => {
    try {
      const { data, error } = await memoService.updateMemo(id, updates);
      if (error) {
        return rejectWithValue(error.message);
      }
      return data;
    } catch (error) {
      return rejectWithValue('메모 수정 중 오류가 발생했습니다.');
    }
  }
);

export const deleteMemo = createAsyncThunk(
  'memos/deleteMemo',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await memoService.deleteMemo(id);
      if (error) {
        return rejectWithValue(error.message);
      }
      return id;
    } catch (error) {
      return rejectWithValue('메모 삭제 중 오류가 발생했습니다.');
    }
  }
);

export const searchMemos = createAsyncThunk(
  'memos/searchMemos',
  async ({ userId, query }: { userId: string; query: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await memoService.searchMemos(userId, query);
      if (error) {
        return rejectWithValue(error.message);
      }
      return data || [];
    } catch (error) {
      return rejectWithValue('메모 검색 중 오류가 발생했습니다.');
    }
  }
);

export const togglePinMemo = createAsyncThunk(
  'memos/togglePinMemo',
  async ({ id, isPinned }: { id: string; isPinned: boolean }, { rejectWithValue }) => {
    try {
      const { data, error } = await memoService.togglePinMemo(id, isPinned);
      if (error) {
        return rejectWithValue(error.message);
      }
      return data;
    } catch (error) {
      return rejectWithValue('메모 고정 설정 중 오류가 발생했습니다.');
    }
  }
);

// 메모 슬라이스
const memosSlice = createSlice({
  name: 'memos',
  initialState,
  reducers: {
    setSelectedMemo: (state, action: PayloadAction<StickerMemo | null>) => {
      state.selectedMemo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMemos: (state) => {
      state.memos = [];
      state.selectedMemo = null;
      state.error = null;
    },
    // 실시간 업데이트를 위한 액션들
    addMemoRealtime: (state, action: PayloadAction<StickerMemo>) => {
      state.memos.unshift(action.payload);
    },
    updateMemoRealtime: (state, action: PayloadAction<StickerMemo>) => {
      const index = state.memos.findIndex(memo => memo.id === action.payload.id);
      if (index !== -1) {
        state.memos[index] = action.payload;
      }
      if (state.selectedMemo?.id === action.payload.id) {
        state.selectedMemo = action.payload;
      }
    },
    deleteMemoRealtime: (state, action: PayloadAction<string>) => {
      state.memos = state.memos.filter(memo => memo.id !== action.payload);
      if (state.selectedMemo?.id === action.payload) {
        state.selectedMemo = null;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchMemos
    builder
      .addCase(fetchMemos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos = action.payload;
      })
      .addCase(fetchMemos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createMemo
    builder
      .addCase(createMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.memos.unshift(action.payload);
        }
      })
      .addCase(createMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateMemo
    builder
      .addCase(updateMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const updatedMemo = action.payload;
          const index = state.memos.findIndex(memo => memo.id === updatedMemo.id);
          if (index !== -1) {
            state.memos[index] = updatedMemo;
          }
          if (state.selectedMemo?.id === updatedMemo.id) {
            state.selectedMemo = updatedMemo;
          }
        }
      })
      .addCase(updateMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteMemo
    builder
      .addCase(deleteMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos = state.memos.filter(memo => memo.id !== action.payload);
        if (state.selectedMemo?.id === action.payload) {
          state.selectedMemo = null;
        }
      })
      .addCase(deleteMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // searchMemos
    builder
      .addCase(searchMemos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMemos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos = action.payload;
      })
      .addCase(searchMemos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // togglePinMemo
    builder
      .addCase(togglePinMemo.fulfilled, (state, action) => {
        if (action.payload) {
          const updatedMemo = action.payload;
          const index = state.memos.findIndex(memo => memo.id === updatedMemo.id);
          if (index !== -1) {
            state.memos[index] = updatedMemo;
          }
          if (state.selectedMemo?.id === updatedMemo.id) {
            state.selectedMemo = updatedMemo;
          }
        }
      })
      .addCase(togglePinMemo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedMemo,
  clearError,
  clearMemos,
  addMemoRealtime,
  updateMemoRealtime,
  deleteMemoRealtime,
} = memosSlice.actions;

export default memosSlice.reducer; 