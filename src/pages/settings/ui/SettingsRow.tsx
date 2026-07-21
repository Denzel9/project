import { Box, Stack, Typography } from '@mui/material';

import type { ReactNode } from 'react';

type SettingsRowProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  titleColor?: string;
};

export const SettingsRow = ({
  title,
  action,
  description,
  titleColor = 'text.primary',
}: SettingsRowProps) => {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        alignItems: { xs: 'start', md: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: titleColor }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, maxWidth: 480 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action}
    </Stack>
  );
};
