import { Box, Stack, Typography } from '@mui/material';

type UnreadCommentsDividerProps = {
  label?: string;
};

export const UnreadCommentsDivider = ({
  label = 'Непрочитанные комментарии',
}: UnreadCommentsDividerProps) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{ py: 1.5, px: 0.25, alignItems: 'center' }}
  >
    <Box
      sx={{
        flex: 1,
        height: '1px',
        bgcolor: 'primary.main',
        opacity: 0.4,
      }}
    />

    <Typography
      variant="caption"
      color="primary.main"
    >
      {label}
    </Typography>

    <Box
      sx={{
        flex: 1,
        height: '1px',
        bgcolor: 'primary.main',
        opacity: 0.4,
      }}
    />
  </Stack>
);
