/**
 * Utility functions for memo operations
 */

import type { StickerMemo } from '../types';
import { MEMO_LIMITS } from '../constants/memo';

/**
 * Calculate appropriate text color (black/white) based on background color
 * Uses WCAG luminance calculation for accessibility
 */
export const getTextColorForBackground = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) {
    return '#000000'; // Default to black
  }
  
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // WCAG luminance calculation formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

/**
 * Get memo title or generate from content
 */
export const getMemoTitle = (memo: StickerMemo): string => {
  const memoData = memo as any;
  const content = memoData.text || memoData.content || '';
  const title = memoData.title || '';
  
  if (title) return title;
  if (content) {
    return content.length > MEMO_LIMITS.PREVIEW_CONTENT_LENGTH 
      ? content.substring(0, MEMO_LIMITS.PREVIEW_CONTENT_LENGTH) + '...'
      : content;
  }
  
  return '제목 없음';
};

/**
 * Get memo content for display
 */
export const getMemoContent = (memo: StickerMemo): string => {
  const memoData = memo as any;
  return memoData.text || memoData.content || '';
};

/**
 * Sort memos by pinned status and date
 */
export const sortMemos = (memos: StickerMemo[]): StickerMemo[] => {
  return [...memos].sort((a, b) => {
    // Pinned memos first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then by date (newest first)
    const dateA = new Date(a.updated_at || a.created_at).getTime();
    const dateB = new Date(b.updated_at || b.created_at).getTime();
    return dateB - dateA;
  });
};

/**
 * Filter memos by search query
 */
export const filterMemosByQuery = (memos: StickerMemo[], query: string): StickerMemo[] => {
  if (!query.trim()) return memos;
  
  const searchQuery = query.toLowerCase();
  
  return memos.filter(memo => {
    const title = getMemoTitle(memo).toLowerCase();
    const content = getMemoContent(memo).toLowerCase();
    const tags = memo.tags || [];
    
    return (
      title.includes(searchQuery) ||
      content.includes(searchQuery) ||
      tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  });
};

/**
 * Validate memo data
 */
export const validateMemo = (text: string): { isValid: boolean; error?: string } => {
  if (!text.trim()) {
    return { isValid: false, error: '메모 내용을 입력해주세요.' };
  }
  
  if (text.length > MEMO_LIMITS.MAX_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      error: `메모는 최대 ${MEMO_LIMITS.MAX_CONTENT_LENGTH}자까지 입력할 수 있습니다.` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate tag
 */
export const validateTag = (tag: string, existingTags: string[]): { isValid: boolean; error?: string } => {
  const trimmedTag = tag.trim();
  
  if (!trimmedTag) {
    return { isValid: false, error: '태그를 입력해주세요.' };
  }
  
  if (trimmedTag.length > MEMO_LIMITS.MAX_TAG_LENGTH) {
    return { 
      isValid: false, 
      error: `태그는 최대 ${MEMO_LIMITS.MAX_TAG_LENGTH}자까지 입력할 수 있습니다.` 
    };
  }
  
  if (existingTags.includes(trimmedTag)) {
    return { isValid: false, error: '이미 추가된 태그입니다.' };
  }
  
  if (existingTags.length >= MEMO_LIMITS.MAX_TAGS) {
    return { 
      isValid: false, 
      error: `태그는 최대 ${MEMO_LIMITS.MAX_TAGS}개까지 추가할 수 있습니다.` 
    };
  }
  
  return { isValid: true };
};
