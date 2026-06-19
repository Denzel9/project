import { useEffect, useRef } from 'react';

import { getScrollableParent } from './getScrollableParent';

type UseInfiniteScrollOptions = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollOptions) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element || !hasMore) return;

    const scrollRoot = getScrollableParent(element);
    const root = scrollRoot instanceof Window ? null : scrollRoot;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { root, rootMargin: '200px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return sentinelRef;
};
