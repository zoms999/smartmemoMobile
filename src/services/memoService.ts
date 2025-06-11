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
    try {
      console.log('🔧 memoService.updateMemo 호출 - id:', id, 'updates:', updates);
      
      // ID를 숫자로 변환
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error('❌ 잘못된 ID 형식:', id);
        return { 
          data: null, 
          error: { message: '잘못된 메모 ID 형식입니다.' } 
        };
      }

      // 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ 사용자 인증 실패:', authError?.message);
        return { 
          data: null, 
          error: { message: '사용자 인증이 필요합니다.' } 
        };
      }

      // 업데이트 데이터에서 불필요한 필드 제거 및 변환
      const cleanUpdates: any = { ...updates };
      
      // content를 text로 변환 (호환성)
      if ('content' in cleanUpdates) {
        cleanUpdates.text = cleanUpdates.content;
        delete cleanUpdates.content;
      }

      console.log('🗂️ Supabase UPDATE 쿼리 실행:', { 
        id: numericId, 
        updates: cleanUpdates,
        userId: user.id 
      });

      const { data, error } = await supabase
        .from('memos')
        .update(cleanUpdates)
        .eq('id', numericId)
        .eq('user_id', user.id) // 보안을 위해 사용자 ID 확인
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase UPDATE 쿼리 오류:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return { data: null, error };
      }

      console.log('✅ Supabase UPDATE 쿼리 성공:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ memoService.updateMemo 예외:', error);
      return { 
        data: null, 
        error: { message: '메모 수정 중 오류가 발생했습니다.' } 
      };
    }
  },

  // 메모 삭제
  async deleteMemo(id: string) {
    console.log('🧰 memoService.deleteMemo 함수 시작 - id:', id);
    
    try {
      // 현재 사용자 인증 정보 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('🔐 사용자 인증 확인:', { 
        user: user?.id, 
        authError: authError?.message,
        hasUser: !!user
      });
      
      if (authError || !user) {
        console.error('❌ 사용자 인증 실패:', authError?.message || '사용자가 없음');
        return { error: { message: '사용자 인증이 필요합니다.' } };
      }

      console.log('🗂️ Supabase DELETE 쿼리 실행 중...');
      console.log('🗂️ 쿼리 조건: id =', id, ', user_id =', user.id);
      
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Supabase DELETE 쿼리 오류:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return { error };
      }

      console.log('✅ Supabase DELETE 쿼리 성공 - 메모 삭제됨:', id);
      return { data: null, error: null };
    } catch (error) {
      console.error('❌ memoService.deleteMemo에서 예외 발생:', error);
      return { error: { message: '메모 삭제 중 오류가 발생했습니다.' } };
    }
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