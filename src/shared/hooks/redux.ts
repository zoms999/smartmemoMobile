import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// 타입이 지정된 useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// 타입이 지정된 useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 