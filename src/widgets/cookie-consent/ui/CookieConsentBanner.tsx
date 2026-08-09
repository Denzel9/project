import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';

/** `all` — все cookie; `necessary` — только обязательные */
export type CookieConsentValue = 'all' | 'necessary';

const STORAGE_KEY = 'nikssens-cookie-consent';

export const getCookieConsent = (): CookieConsentValue | null => {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === 'all' || value === 'necessary') return value;
  return null;
};

export const CookieConsentBanner = () => {
  const isAuth = useAuthStore(state => state.isAuth);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAuth || getCookieConsent()) {
      setTimeout(() => {
        setVisible(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setVisible(true);
    }, 0);
  }, [isAuth]);

  const saveConsent = (value: CookieConsentValue) => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme => theme.zIndex.snackbar,
        position: 'fixed',
        p: { xs: 1.5, sm: 2 },
        pointerEvents: 'none',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          gap: 2,
          mx: 'auto',
          display: 'flex',
          maxWidth: 1100,
          pointerEvents: 'auto',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          p: { xs: 2, sm: 2.25 },
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.55 }}>
          Мы используем обязательные cookie для авторизации и работы сервиса.
          Необязательные — для аналитики и улучшения продукта. Вы можете принять
          все или оставить только необходимые.{' '}
          <Link
            component={RouterLink}
            to={ROUTES.PRIVACY_POLICY}
            underline="hover"
            color="primary"
          >
            Политика конфиденциальности
          </Link>
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            onClick={() => saveConsent('necessary')}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Только необходимые
          </Button>
          <Button
            variant="contained"
            onClick={() => saveConsent('all')}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Принять все
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
