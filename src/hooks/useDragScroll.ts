import { useRef, useEffect } from 'react';
import { Platform } from 'react-native';

export const useDragScroll = () => {
  const scrollRef = useRef<any>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      scrollStart.current = {
        x: scrollElement.scrollLeft || 0,
        y: scrollElement.scrollTop || 0,
      };
      
      // 드래그 중 텍스트 선택 방지
      e.preventDefault();
      document.body.style.userSelect = 'none';
      scrollElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      e.preventDefault();
      
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      scrollElement.scrollLeft = scrollStart.current.x - deltaX;
      scrollElement.scrollTop = scrollStart.current.y - deltaY;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
      scrollElement.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
      scrollElement.style.cursor = 'grab';
    };

    // 이벤트 리스너 등록
    scrollElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    scrollElement.addEventListener('mouseleave', handleMouseLeave);

    // 클린업
    return () => {
      scrollElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      scrollElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return scrollRef;
}; 