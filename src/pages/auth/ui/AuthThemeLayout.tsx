import { Box, ThemeProvider } from '@mui/material';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { createAppTheme } from '@/app/theme/theme';
import { AUTH_BACKGROUND } from '@/features/auth/model/constants';
import { RouteSuspense } from '@/shared/ui/route-fallback/RouteSuspense';

const authTheme = createAppTheme('dark');

export const AuthThemeLayout = () => {
  useEffect(() => {
    const previousBackground = document.body.style.backgroundColor;
    const previousColor = document.body.style.color;

    document.body.style.backgroundColor = AUTH_BACKGROUND;
    document.body.style.color = '#FFFFFF';

    return () => {
      document.body.style.backgroundColor = previousBackground;
      document.body.style.color = previousColor;
    };
  }, []);

  return (
    <ThemeProvider theme={authTheme}>
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: AUTH_BACKGROUND,
          color: '#FFFFFF',
        }}
      >
        <RouteSuspense>
          <Outlet />
        </RouteSuspense>
      </Box>
    </ThemeProvider>
  );
};

export default AuthThemeLayout;
