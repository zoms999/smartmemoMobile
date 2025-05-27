import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StickerMemo } from '../../types';

interface MemosState {
  memos: StickerMemo[];
  selectedMemo: StickerMemo | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filteredMemos: StickerMemo[];
}

const initialState: MemosState = {
  memos: [],
  selectedMemo: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filteredMemos: [],
};

// 비동기 액션들 (추후 Supabase 연동 시 구현)
export const fetchMemos = createAsyncThunk(
  'memos/fetchMemos',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Supabase에서 메모 목록 가져오기
      // const { data, error } = await supabase.from('memos').select('*');
      // if (error) throw error;
      // return data;
      
      // 임시 데이터 반환
      return [
        {
          id: '1',
          user_id: 'user1',
          title: '회의 준비',
          content: '프로젝트 진행 상황 정리\n- UI 디자인 완료\n- API 연동 진행 중',
          color: '#FFE4E1',
          tags: ['업무', '회의'],
          priority: 'high' as const,
          position_x: 0,
          position_y: 0,
          is_pinned: false,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          title: '장보기 목록',
          content: '- 우유\n- 빵\n- 계란\n- 사과',
          color: '#E1F5FE',
          tags: ['개인', '쇼핑'],
          priority: 'medium' as const,
          position_x: 0,
          position_y: 0,
          is_pinned: false,
          created_at: '2024-01-14T15:20:00Z',
          updated_at: '2024-01-14T15:20:00Z',
        },
      ];
    } catch (error) {
      return rejectWithValue('메모를 불러오는 중 오류가 발생했습니다.');
    }
  }
);

export const createMemo = createAsyncThunk(
  'memos/createMemo',
  async (memoData: Omit<StickerMemo, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      // TODO: Supabase에 메모 생성
      // const { data, error } = await supabase.from('memos').insert([memoData]).select().single();
      // if (error) throw error;
      // return data;
      
      // 임시 데이터 반환
      const newMemo: StickerMemo = {
        ...memoData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newMemo;
    } catch (error) {
      return rejectWithValue('메모 생성 중 오류가 발생했습니다.');
    }
  }
);

export const updateMemo = createAsyncThunk(
  'memos/updateMemo',
  async ({ id, updates }: { id: string; updates: Partial<StickerMemo> }, { rejectWithValue }) => {
    try {
      // TODO: Supabase에서 메모 업데이트
      // const { data, error } = await supabase
      //   .from('memos')
      //   .update({ ...updates, updated_at: new Date().toISOString() })
      //   .eq('id', id)
      //   .select()
      //   .single();
      // if (error) throw error;
      // return data;
      
      // 임시 데이터 반환
      return { id, updates: { ...updates, updated_at: new Date().toISOString() } };
    } catch (error) {
      return rejectWithValue('메모 수정 중 오류가 발생했습니다.');
    }
  }
);

export const deleteMemo = createAsyncThunk(
  'memos/deleteMemo',
  async (id: string, { rejectWithValue }) => {
    try {
      // TODO: Supabase에서 메모 삭제
      // const { error } = await supabase.from('memos').delete().eq('id', id);
      // if (error) throw error;
      
      return id;
    } catch (error) {
      return rejectWithValue('메모 삭제 중 오류가 발생했습니다.');
    }
  }
);

const memosSlice = createSlice({
  name: 'memos',
  initialState,
  reducers: {
    setSelectedMemo: (state, action: PayloadAction<StickerMemo | null>) => {
      state.selectedMemo = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      // 검색 필터링
      if (action.payload.trim() === '') {
        state.filteredMemos = state.memos;
      } else {
        const query = action.payload.toLowerCase();
        state.filteredMemos = state.memos.filter(
          memo =>
            memo.title.toLowerCase().includes(query) ||
            memo.content.toLowerCase().includes(query) ||
            memo.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    pinMemo: (state, action: PayloadAction<string>) => {
      const memo = state.memos.find(m => m.id === action.payload);
      if (memo) {
        memo.is_pinned = !memo.is_pinned;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 메모 목록 가져오기
      .addCase(fetchMemos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos = action.payload;
        state.filteredMemos = action.payload;
        state.error = null;
      })
      .addCase(fetchMemos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 메모 생성
      .addCase(createMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos.unshift(action.payload);
        state.filteredMemos = state.memos;
        state.error = null;
      })
      .addCase(createMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 메모 업데이트
      .addCase(updateMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, updates } = action.payload;
        const index = state.memos.findIndex(memo => memo.id === id);
        if (index !== -1) {
          state.memos[index] = { ...state.memos[index], ...updates };
        }
        state.filteredMemos = state.memos;
        state.error = null;
      })
      .addCase(updateMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 메모 삭제
      .addCase(deleteMemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMemo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memos = state.memos.filter(memo => memo.id !== action.payload);
        state.filteredMemos = state.memos;
        if (state.selectedMemo?.id === action.payload) {
          state.selectedMemo = null;
        }
        state.error = null;
      })
      .addCase(deleteMemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMemo, setSearchQuery, clearError, pinMemo } = memosSlice.actions;
export default memosSlice.reducer; 