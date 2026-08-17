import { Chip, Stack } from '@mui/material';

type ChatDaySeparatorProps = {
  label: string;
};

export const ChatDaySeparator = ({ label }: ChatDaySeparatorProps) => (
  <Stack
    direction="row"
    sx={{
      my: 2,
      width: '100%',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Chip
      size="small"
      label={label}
      sx={{
        height: 28,
        fontSize: 12,
        fontWeight: 600,
        bgcolor: 'background.paper',
        color: 'text.secondary',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      }}
    />
  </Stack>
);
