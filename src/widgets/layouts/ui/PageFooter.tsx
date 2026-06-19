import { Cyclone } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { ROUTES } from '@/shared';

const FOOTER_LINKS = [
  { label: 'Настройки', path: ROUTES.SETTINGS },
  { label: 'Избранное', path: ROUTES.FAVORITES },
  { label: 'Профиль', path: ROUTES.PROFILE },
] as const;

const linkSx = {
  color: 'info.main',
  textDecoration: 'none',
  transition: 'color 0.2s',
  '&:hover': {
    color: 'primary.main',
  },
};

export const PageFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        p: { xs: 2, md: 4 },
        bgcolor: 'white',
        borderTopLeftRadius: { xs: '16px', md: '32px' },
        borderTopRightRadius: { xs: '16px', md: '32px' },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 0 }}
        sx={{
          alignItems: { xs: 'center', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Cyclone
            color="primary"
            sx={{ fontSize: { xs: 28, md: 32 } }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, lineHeight: 1 }}
          >
            LOGO
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1, md: 3 }}
          sx={{ alignItems: 'center' }}
        >
          {FOOTER_LINKS.map(({ label, path }) => (
            <Typography
              key={path}
              component={Link}
              to={path}
              variant="body2"
              sx={linkSx}
            >
              {label}
            </Typography>
          ))}
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: 'info.main' }}
        >
          © {year} LOGO
        </Typography>
      </Stack>
    </Box>
  );
};

export default PageFooter;
