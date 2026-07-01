import { Box, Typography } from '@mui/material';

import type { ReactNode } from 'react';

type FilterSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const FilterSection = ({
  title,
  description,
  children,
}: FilterSectionProps) => (
  <Box
    sx={{
      p: 2,
      borderRadius: '20px',
      bgcolor: 'grey.50',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{ mb: description ? 0.5 : 1.5, fontWeight: 600 }}
    >
      {title}
    </Typography>

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
