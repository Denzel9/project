import { Box, Skeleton, Stack } from '@mui/material';

export const MyResponseItemSkeleton = () => (
  <Stack
    sx={{
      height: '100%',
      overflow: 'hidden',
      bgcolor: 'white',
      borderRadius: '24px',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Skeleton
      variant="rectangular"
      sx={{ width: '100%', height: 140 }}
    />

    <Stack
      spacing={1.5}
      sx={{ p: 2 }}
    >
      <Stack
        direction="row"
        spacing={1}
      >
        <Skeleton
          variant="rounded"
          width={72}
          height={24}
        />
        <Skeleton
          variant="rounded"
          width={88}
          height={24}
        />
      </Stack>

      <Skeleton
        variant="text"
        sx={{ fontSize: '1.1rem', width: '85%' }}
      />
      <Skeleton
        variant="text"
        sx={{ width: '55%' }}
      />

      <Skeleton
        variant="rounded"
        height={64}
        sx={{ mt: 1 }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Skeleton
          variant="rounded"
          width={100}
          height={32}
        />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
        />
      </Stack>
    </Stack>
  </Stack>
);

type MyResponseItemSkeletonListProps = {
  count?: number;
};

export const MyResponseItemSkeletonList = ({
  count = 6,
}: MyResponseItemSkeletonListProps) => (
  <Box
    sx={{
      gap: 1.5,
      width: '100%',
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(3, minmax(0, 1fr))',
      },
    }}
  >
    {Array.from({ length: count }, (_, index) => (
      <MyResponseItemSkeleton key={index} />
    ))}
  </Box>
);
