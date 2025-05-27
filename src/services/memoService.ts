import { supabase } from './supabase';
import type { StickerMemo } from '../types';

export const memoService = {
  // 사용자의 모든 메모 조회
  async getMemos(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 특정 메모 조회
  async getMemo(id: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  // 새 메모 생성
  async createMemo(memo: Omit<StickerMemo, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('memos')
      .insert([memo])
      .select()
      .single();
    
    return { data, error };
  },

  // 메모 수정
  async updateMemo(id: string, updates: Partial<Omit<StickerMemo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('memos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // 메모 삭제
  async deleteMemo(id: string) {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // 메모 검색
  async searchMemos(userId: string, query: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 태그별 메모 조회
  async getMemosByTag(userId: string, tag: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 우선순위별 메모 조회
  async getMemosByPriority(userId: string, priority: 'low' | 'medium' | 'high') {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .eq('priority', priority)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 고정된 메모 조회
  async getPinnedMemos(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 메모 고정/고정 해제
  async togglePinMemo(id: string, isPinned: boolean) {
    const { data, error } = await supabase
      .from('memos')
      .update({ is_pinned: isPinned })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // 실시간 메모 변경 구독
  subscribeToMemos(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('memos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memos',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
}; 