import { Box, CircularProgress } from '@mui/material';

import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

type InfiniteScrollSentinelProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export const InfiniteScrollSentinel = ({
  hasMore,
  isLoading,
  onLoadMore,
}: InfiniteScrollSentinelProps) => {
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

  if (!hasMore && !isLoading) return null;

  return (
    <Box
      ref={sentinelRef}
      sx={{
        py: 2,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {isLoading && <CircularProgress size={24} />}
    </Box>
  );
};
