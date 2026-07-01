import { Box, Skeleton, Stack } from '@mui/material';

const TABLE_SHELL_SX = {
  width: '100%',
  overflowX: 'auto' as const,
  bgcolor: 'white',
  borderRadius: { xs: '16px', md: '32px' },
  border: (theme: { palette: { secondary: { main: string } } }) =>
    `1px solid ${theme.palette.secondary.main}`,
};

export const PartnersTableSkeleton = () => (
  <Box sx={TABLE_SHELL_SX}>
    <Stack
      spacing={1.5}
      sx={{ p: 2 }}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={52}
          sx={{ borderRadius: '12px' }}
        />
      ))}
    </Stack>
  </Box>
);

export const partnersTableShellSx = TABLE_SHELL_SX;
