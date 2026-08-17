import { Box, Skeleton, Stack } from '@mui/material';

type PublicationItemSkeletonListProps = {
  count?: number;
};

const PublicationItemSkeleton = () => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '24px',
      overflow: 'hidden',
    }}
  >
    <Skeleton
      variant="rectangular"
      sx={{ aspectRatio: '16 / 10', width: '100%' }}
    />

    <Stack
      spacing={1.5}
      sx={{ p: 2 }}
    >
      <Skeleton
        variant="rounded"
        height={28}
        width="80%"
      />
      <Skeleton
        variant="rounded"
        height={20}
      />
      <Skeleton
        variant="rounded"
        height={20}
        width="90%"
      />
      <Skeleton
        variant="rounded"
        height={72}
      />
      <Stack
        direction="row"
        spacing={1}
      >
        <Skeleton
          variant="rounded"
          height={32}
          width={96}
        />
        <Skeleton
          variant="rounded"
          height={32}
          width={140}
        />
      </Stack>
    </Stack>
  </Box>
);

export const PublicationItemSkeletonList = ({
  count = 6,
}: PublicationItemSkeletonListProps) => (
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
      <PublicationItemSkeleton key={index} />
    ))}
  </Box>
);
