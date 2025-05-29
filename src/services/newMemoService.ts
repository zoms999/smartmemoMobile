import { supabase } from './supabase';
import type { Memo, Category, CreateMemoRequest } from '../types';

export const newMemoService = {
  // 카테고리 관련 메서드
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    return { data, error };
  },

  async createCategory(name: string, color: string) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, color }])
      .select()
      .single();
    
    return { data, error };
  },

  // 메모 관련 메서드
  async getMemos(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async getMemo(id: number) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  async createMemo(memo: CreateMemoRequest) {
    // id는 자동 생성되므로 제외하고 나머지 필드들만 삽입
    const { data, error } = await supabase
      .from('memos')
      .insert([{
        text: memo.text,
        is_widget: memo.is_widget || false,
        category_id: memo.category_id,
        priority: memo.priority,
        tags: memo.tags,
        color: memo.color,
        reminder: memo.reminder,
        images: memo.images || [],
        user_id: memo.user_id,
      }])
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .single();
    
    return { data, error };
  },

  async updateMemo(id: number, updates: Partial<Omit<Memo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('memos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .single();
    
    return { data, error };
  },

  async deleteMemo(id: number) {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // 검색 메서드
  async searchMemos(userId: string, query: string) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .textSearch('text', query)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 카테고리별 메모 조회
  async getMemosByCategory(userId: string, categoryId: number) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 우선순위별 메모 조회
  async getMemosByPriority(userId: string, priority: number) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('priority', priority)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 위젯 메모 조회
  async getWidgetMemos(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('is_widget', true)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 리마인더가 있는 메모 조회
  async getMemosWithReminders(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .not('reminder', 'is', null)
      .order('reminder', { ascending: true });
    
    return { data, error };
  },

  // 태그로 메모 검색
  async getMemosByTag(userId: string, tag: string) {
    const { data, error } = await supabase
      .from('memos')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 실시간 메모 변경 구독
  subscribeToMemos(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('new_memos')
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

  // 카테고리 변경 구독
  subscribeToCategories(callback: (payload: unknown) => void) {
    return supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        callback
      )
      .subscribe();
  },
}; 