import { Box, Skeleton, Stack } from '@mui/material';

export const IncomingApplicationItemSkeleton = () => (
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
      sx={{ width: '100%', height: 120 }}
    />

    <Stack
      spacing={1.5}
      sx={{ p: 2 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center' }}
      >
        <Skeleton
          variant="circular"
          width={44}
          height={44}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            sx={{ width: '60%' }}
          />
          <Skeleton
            variant="text"
            sx={{ width: '40%' }}
          />
        </Box>
      </Stack>

      <Skeleton
        variant="text"
        sx={{ fontSize: '1.1rem', width: '85%' }}
      />
      <Skeleton
        variant="rounded"
        height={72}
      />
      <Skeleton
        variant="rounded"
        height={88}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Skeleton
          variant="rounded"
          width={96}
          height={32}
        />
        <Skeleton
          variant="rounded"
          width={96}
          height={32}
        />
      </Stack>
    </Stack>
  </Stack>
);

type IncomingApplicationItemSkeletonListProps = {
  count?: number;
};

export const IncomingApplicationItemSkeletonList = ({
  count = 6,
}: IncomingApplicationItemSkeletonListProps) => (
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
      <IncomingApplicationItemSkeleton key={index} />
    ))}
  </Box>
);
