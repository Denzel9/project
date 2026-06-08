import { Stack, Typography } from '@mui/material';

type SettingsPlaceholderProps = {
  title: string;
};

export const SettingsPlaceholder = ({ title }: SettingsPlaceholderProps) => {
  return (
    <Stack spacing={2}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600 }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
      >
        Coming soon
      </Typography>
    </Stack>
  );
};
