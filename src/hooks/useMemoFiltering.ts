/**
 * Custom hook for memo filtering and sorting logic
 */

import { useMemo } from 'react';
import type { StickerMemo } from '../types';
import { sortMemos, filterMemosByQuery } from '../utils/memoUtils';

interface UseMemoFilteringProps {
  memos: StickerMemo[];
  searchQuery: string;
}

interface UseMemoFilteringReturn {
  filteredMemos: StickerMemo[];
  hasResults: boolean;
  isEmpty: boolean;
}

export const useMemoFiltering = ({ 
  memos, 
  searchQuery 
}: UseMemoFilteringProps): UseMemoFilteringReturn => {
  const filteredMemos = useMemo(() => {
    const sortedMemos = sortMemos(memos);
    return filterMemosByQuery(sortedMemos, searchQuery);
  }, [memos, searchQuery]);

  const hasResults = filteredMemos.length > 0;
  const isEmpty = memos.length === 0;

  return {
    filteredMemos,
    hasResults,
    isEmpty,
  };
};
