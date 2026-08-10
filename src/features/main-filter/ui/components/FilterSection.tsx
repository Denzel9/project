import { Box, Typography } from '@mui/material';

import type { ReactNode } from 'react';

type FilterSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export const FilterSection = ({
  title,
  description,
  children,
}: FilterSectionProps) => (
  <Box>
    {title && (
      <Typography
        variant="subtitle1"
        color="info"
        sx={{ mb: description ? 0.5 : 1.5, fontWeight: 600 }}
      >
        {title}
      </Typography>
    )}

    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1.5 }}
      >
        {description}
      </Typography>
    )}

    {children}
  </Box>
);
