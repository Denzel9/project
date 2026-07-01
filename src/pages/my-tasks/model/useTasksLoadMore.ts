import { useEffect, useMemo, useRef, useState } from 'react';

import { TASK_TABLE_PAGE_SIZE } from './constants';

type UseTasksLoadMoreOptions = {
  step?: number;
};

export const useTasksLoadMore = <T,>(
  items: T[],
  resetKey: string,
  { step = TASK_TABLE_PAGE_SIZE }: UseTasksLoadMoreOptions = {},
) => {
  const [visibleCount, setVisibleCount] = useState(step);
  const resetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (resetKeyRef.current === resetKey) return;

    resetKeyRef.current = resetKey;
    setVisibleCount(step);
  }, [resetKey, step]);

  const effectiveVisibleCount = Math.min(visibleCount, items.length);

  const visibleItems = useMemo(
    () => items.slice(0, effectiveVisibleCount),
    [items, effectiveVisibleCount],
  );

  const hiddenCount = items.length - effectiveVisibleCount;
  const hasMore = hiddenCount > 0;

  const loadMore = () => {
    setVisibleCount(current => Math.min(current + step, items.length));
  };

  return {
    visibleItems,
    hasMore,
    hiddenCount,
    loadMore,
  };
};
