/**
 * Custom hook for memo actions (delete, pin, edit, etc.)
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import type { RootState, AppDispatch } from '../store';
import { deleteMemo, togglePinMemo } from '../store/slices/memosSlice';
import type { StickerMemo, RootStackParamList } from '../types';
import { UI_MESSAGES } from '../constants/memo';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UseMemoActionsReturn {
  // State
  menuVisibleId: string | null;
  deleteDialogVisible: boolean;
  memoToDelete: string | null;
  
  // Actions
  setMenuVisibleId: (id: string | null) => void;
  handleDeleteMemo: (memoId: string) => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
  handleTogglePin: (memoId: string, currentPinStatus: boolean) => void;
  handleEditMemo: (memo: StickerMemo) => void;
  handleCreateMemo: () => void;
}

export const useMemoActions = (): UseMemoActionsReturn => {
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [memoToDelete, setMemoToDelete] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDeleteMemo = (memoId: string) => {
    if (!user?.id) {
      Alert.alert('오류', UI_MESSAGES.ERRORS.LOGIN_REQUIRED);
      return;
    }
    
    setMenuVisibleId(null);
    setMemoToDelete(memoId);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!memoToDelete) return;
    
    dispatch(deleteMemo(memoToDelete));
    setDeleteDialogVisible(false);
    setMemoToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogVisible(false);
    setMemoToDelete(null);
  };

  const handleTogglePin = (memoId: string, currentPinStatus: boolean) => {
    setMenuVisibleId(null);
    dispatch(togglePinMemo({ id: memoId, isPinned: !currentPinStatus }));
  };

  const handleEditMemo = (memo: StickerMemo) => {
    setMenuVisibleId(null);
    navigation.navigate('MemoDetail', { memoId: memo.id });
  };

  const handleCreateMemo = () => {
    navigation.navigate('CreateMemo');
  };

  return {
    // State
    menuVisibleId,
    deleteDialogVisible,
    memoToDelete,
    
    // Actions
    setMenuVisibleId,
    handleDeleteMemo,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleTogglePin,
    handleEditMemo,
    handleCreateMemo,
  };
};
