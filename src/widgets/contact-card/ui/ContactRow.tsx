import { Box, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { Link } from 'react-router';

export type ContactRowProps = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  label?: string;
};

export const ContactRow = ({ href, icon, children, label }: ContactRowProps) => (
  <Box
    component={Link}
    to={href}
    target="_blank"
    sx={{
      display: 'flex',
      alignItems: label ? 'flex-start' : 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: '16px',
      bgcolor: 'secondary.light',
      color: 'inherit',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'info.light',
        color: 'primary.main',
      },
    }}
  >
    <Box sx={{ mt: label ? 0.25 : 0, color: 'primary.main', display: 'flex' }}>
      {icon}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      {label && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 0.25,
            color: 'info.main',
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ fontWeight: label ? 500 : 400, wordBreak: 'break-word' }}
      >
        {children}
      </Typography>
    </Box>
  </Box>
);
