import { Box, Skeleton, Stack } from '@mui/material';

export const partnersTableShellSx = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden' as const,
  bgcolor: 'background.paper',
  borderRadius: { xs: '16px', md: '32px' },
  border: (theme: { palette: { secondary: { main: string } } }) =>
    `1px solid ${theme.palette.secondary.main}`,
};

export const PartnersTableSkeleton = () => (
  <Box sx={partnersTableShellSx}>
    <Stack
      spacing={1.5}
      sx={{ p: 2, flex: 1 }}
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
