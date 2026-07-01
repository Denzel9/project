import { Box, Grid, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type DashboardCardSectionProps = {
  title: string;
  children: ReactNode;
};

export const DashboardCardSection = ({
  title,
  children,
}: DashboardCardSectionProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{
        px: 0.5,
        display: 'block',
        mb: 1,
        fontWeight: 600,
        letterSpacing: '0.08em',
      }}
    >
      {title}
    </Typography>

    <Grid
      container
      spacing={1}
    >
      {children}
    </Grid>
  </Box>
);
