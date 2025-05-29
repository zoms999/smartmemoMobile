import { supabase } from './supabase';
import type { Memo, Category, CreateMemoRequest, Tag } from '../types';

export const newMemoService = {
  // 태그 관련 메서드
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    return { data, error };
  },

  async createTag(name: string) {
    // 중복 태그 체크 후 생성
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name.trim())
      .single();

    if (existingTag) {
      return { data: existingTag, error: null };
    }

    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: name.trim() }])
      .select()
      .single();
    
    return { data, error };
  },

  async searchTags(query: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);
    
    return { data, error };
  },

  async getOrCreateTags(tagNames: string[]) {
    const tags: Tag[] = [];
    
    for (const tagName of tagNames) {
      const trimmedName = tagName.trim();
      if (trimmedName) {
        const { data } = await this.createTag(trimmedName);
        if (data) {
          tags.push(data);
        }
      }
    }
    
    return tags;
  },

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
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async getMemo(id: number) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  async createMemo(memo: CreateMemoRequest) {
    // 태그들을 tags 테이블에서 생성/조회 후 메모에 태그 이름 배열로 저장
    await this.getOrCreateTags(memo.tags);

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
      .select('*')  // 임시로 categories 조인 제거
      .single();
    
    return { data, error };
  },

  async updateMemo(id: number, updates: Partial<Omit<Memo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    // 태그 업데이트 시 tags 테이블에서 생성/조회
    if (updates.tags) {
      await this.getOrCreateTags(updates.tags);
    }

    const { data, error } = await supabase
      .from('memos')
      .update(updates)
      .eq('id', id)
      .select('*')  // 임시로 categories 조인 제거
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
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .textSearch('text', query)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 카테고리별 메모 조회
  async getMemosByCategory(userId: string, categoryId: number) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 우선순위별 메모 조회
  async getMemosByPriority(userId: string, priority: number) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .eq('priority', priority)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 위젯 메모 조회
  async getWidgetMemos(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .eq('is_widget', true)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 리마인더가 있는 메모 조회
  async getMemosWithReminders(userId: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .not('reminder', 'is', null)
      .order('reminder', { ascending: true });
    
    return { data, error };
  },

  // 태그로 메모 검색
  async getMemosByTag(userId: string, tag: string) {
    const { data, error } = await supabase
      .from('memos')
      .select('*')  // 임시로 categories 조인 제거
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 인기 태그 조회 (사용빈도 높은 태그)
  async getPopularTags(limit: number = 10) {
    try {
      // PostgreSQL 함수를 사용하여 tags 배열에서 가장 많이 사용된 태그들 조회
      const { data, error } = await supabase
        .rpc('get_popular_tags', { tag_limit: limit });
      
      if (error) {
        console.warn('RPC get_popular_tags 함수 호출 실패, 일반 태그 목록 사용:', error);
        // RPC 함수가 없거나 실패한 경우 일반 태그 목록으로 대체
        return await this.getTags();
      }
      
      return { data, error: null };
    } catch (error) {
      console.warn('getPopularTags 예외 발생, 일반 태그 목록 사용:', error);
      // 예외 발생 시 일반 태그 목록으로 대체
      return await this.getTags();
    }
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

  // 태그 변경 구독
  subscribeToTags(callback: (payload: unknown) => void) {
    return supabase
      .channel('tags')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags',
        },
        callback
      )
      .subscribe();
  },
}; 