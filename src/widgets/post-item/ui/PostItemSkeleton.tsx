import { Box, Skeleton, Stack } from '@mui/material';

type PostItemSkeletonProps = {
  isCompact?: boolean;
};

export const PostItemSkeleton = ({
  isCompact = false,
}: PostItemSkeletonProps) => (
  <Box
    sx={{
      gap: 2,
      width: '100%',
      display: 'flex',
      bgcolor: 'white',
      p: { xs: 3, lg: 4 },
      borderRadius: '32px',
      flexDirection: { xs: 'column', lg: 'row' },
      border: theme => `1px solid ${theme.palette.secondary.main}`,
    }}
  >
    <Skeleton
      variant="rounded"
      sx={{
        flexShrink: 0,
        borderRadius: '16px',
        width: { xs: '100%', md: isCompact ? '400px' : '500px' },
        height: { xs: '400px', md: isCompact ? '350px' : '450px' },
      }}
    />

    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Skeleton
            variant="text"
            sx={{ fontSize: '1.5rem', width: { xs: '70%', md: '50%' } }}
          />
          <Stack
            direction="row"
            spacing={1}
          >
            <Skeleton
              variant="circular"
              width={40}
              height={40}
            />
            <Skeleton
              variant="circular"
              width={40}
              height={40}
            />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2, flexWrap: 'wrap' }}
        >
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
          />
          <Skeleton
            variant="rounded"
            width={100}
            height={24}
          />
          <Skeleton
            variant="rounded"
            width={70}
            height={24}
          />
        </Stack>

        <Skeleton
          variant="text"
          sx={{ fontSize: '1.25rem', mt: 4, width: '40%' }}
        />

        <Skeleton
          variant="rounded"
          width={120}
          height={24}
          sx={{ mt: 1 }}
        />

        <Stack
          spacing={1}
          sx={{ mt: 4, maxWidth: 700 }}
        >
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton
            variant="text"
            width="80%"
          />
        </Stack>
      </Box>

      {!isCompact && (
        <Stack
          direction="row"
          spacing={2}
        >
          <Skeleton
            variant="rounded"
            width={140}
            height={44}
          />
          <Skeleton
            variant="rounded"
            width={140}
            height={44}
          />
        </Stack>
      )}
    </Box>
  </Box>
);

type PostItemSkeletonListProps = {
  count?: number;
  isCompact?: boolean;
};

export const PostItemSkeletonList = ({
  count = 5,
  isCompact = false,
}: PostItemSkeletonListProps) => (
  <Stack
    spacing={2}
    sx={{ width: '100%' }}
  >
    {Array.from({ length: count }, (_, index) => (
      <PostItemSkeleton
        key={index}
        isCompact={isCompact}
      />
    ))}
  </Stack>
);

export default PostItemSkeleton;
