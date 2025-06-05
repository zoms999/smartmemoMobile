import { supabase } from './supabase';
import type { LotteryNumbers, CreateLotteryNumbersRequest } from '../types';

export class LotteryService {
  // 로또 번호 생성 및 저장
  async createLotteryNumbers(request: CreateLotteryNumbersRequest): Promise<LotteryNumbers> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('lottery_numbers')
      .insert({
        user_id: user.id,
        numbers: request.numbers,
        bonus_number: request.bonus_number,
        generation_method: request.generation_method,
        is_favorite: request.is_favorite || false,
        is_purchased: false,
        notes: request.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('로또 번호 저장 오류:', error);
      throw new Error('로또 번호 저장에 실패했습니다.');
    }

    return data;
  }

  // 사용자의 로또 번호 목록 조회
  async getLotteryNumbers(limit = 20, offset = 0): Promise<LotteryNumbers[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('lottery_numbers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('로또 번호 조회 오류:', error);
      throw new Error('로또 번호 조회에 실패했습니다.');
    }

    return data || [];
  }

  // 즐겨찾기 토글
  async toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('lottery_numbers')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) {
      console.error('즐겨찾기 업데이트 오류:', error);
      throw new Error('즐겨찾기 설정에 실패했습니다.');
    }
  }

  // 구매 상태 업데이트
  async updatePurchaseStatus(id: number, isPurchased: boolean, purchaseDate?: string): Promise<void> {
    const updateData: any = { is_purchased: isPurchased };
    if (purchaseDate) {
      updateData.purchase_date = purchaseDate;
    }

    const { error } = await supabase
      .from('lottery_numbers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('구매 상태 업데이트 오류:', error);
      throw new Error('구매 상태 업데이트에 실패했습니다.');
    }
  }

  // 로또 번호 삭제
  async deleteLotteryNumbers(id: number): Promise<void> {
    const { error } = await supabase
      .from('lottery_numbers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('로또 번호 삭제 오류:', error);
      throw new Error('로또 번호 삭제에 실패했습니다.');
    }
  }

  // 메모 업데이트
  async updateNotes(id: number, notes: string): Promise<void> {
    const { error } = await supabase
      .from('lottery_numbers')
      .update({ notes })
      .eq('id', id);

    if (error) {
      console.error('메모 업데이트 오류:', error);
      throw new Error('메모 업데이트에 실패했습니다.');
    }
  }

  // 즐겨찾기 목록 조회
  async getFavoriteLotteryNumbers(): Promise<LotteryNumbers[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('lottery_numbers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('즐겨찾기 로또 번호 조회 오류:', error);
      throw new Error('즐겨찾기 로또 번호 조회에 실패했습니다.');
    }

    return data || [];
  }

  // 통계 조회 (생성 방법별, 구매 여부별 등)
  async getStatistics(): Promise<{
    total: number;
    ai_generated: number;
    manual_generated: number;
    purchased: number;
    favorites: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('lottery_numbers')
      .select('generation_method, is_purchased, is_favorite')
      .eq('user_id', user.id);

    if (error) {
      console.error('통계 조회 오류:', error);
      throw new Error('통계 조회에 실패했습니다.');
    }

    const stats = {
      total: data.length,
      ai_generated: data.filter(item => item.generation_method === 'AI').length,
      manual_generated: data.filter(item => item.generation_method === 'MANUAL').length,
      purchased: data.filter(item => item.is_purchased).length,
      favorites: data.filter(item => item.is_favorite).length,
    };

    return stats;
  }
}

export const lotteryService = new LotteryService(); 