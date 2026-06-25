import { Box, Typography } from '@mui/material';

import type { ReactNode } from 'react';

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const FormSection = ({
  title,
  description,
  children,
}: FormSectionProps) => (
  <Box
    sx={{
      mt: 4,
      p: { xs: 2, md: 3 },
      borderRadius: '24px',
      bgcolor: 'secondary.light',
    }}
  >
    <Typography
      variant="h6"
      sx={{ mb: description ? 1 : 2, fontWeight: 600 }}
    >
      {title}
    </Typography>

    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {description}
      </Typography>
    )}

    {children}
  </Box>
);
