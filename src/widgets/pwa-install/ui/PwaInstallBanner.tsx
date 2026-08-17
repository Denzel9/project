import { Close, InstallMobile } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';

import { usePwaInstallBanner } from '../model/usePwaInstallBanner';

export const PwaInstallBanner = () => {
  const { visible, canPrompt, isIos, dismiss, install } = usePwaInstallBanner();

  if (!visible) return null;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        mb: 1,
        gap: 2,
        p: 2,
        border: '1px solid',
        borderRadius: '24px',
        alignItems: { xs: 'start', md: 'center' },
        bgcolor: 'info.light',
        borderColor: 'primary.main',
        justifyContent: 'space-between',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ width: '100%', alignItems: 'start' }}
      >
        <InstallMobile sx={{ mt: 0.25, color: 'primary.main' }} />

        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'start',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              Установите приложение
            </Typography>

            <IconButton
              aria-label="Скрыть"
              onClick={dismiss}
              sx={{
                color: 'primary.main',
                display: { xs: 'inline-flex', md: 'none' },
              }}
            >
              <Close />
            </IconButton>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: 'text.primary' }}
          >
            {isIos
              ? 'Добавьте Nikssens на главный экран: нажмите «Поделиться» и выберите «На экран Домой».'
              : 'Добавьте Nikssens на главный экран — так удобнее открывать сервис и получать уведомления.'}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'flex-end', md: 'center' },
          flexShrink: 0,
        }}
      >
        {canPrompt && (
          <Button
            size="small"
            variant="contained"
            onClick={() => void install()}
          >
            Установить
          </Button>
        )}

        <IconButton
          aria-label="Скрыть"
          onClick={dismiss}
          sx={{
            color: 'primary.main',
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <Close />
        </IconButton>
      </Stack>
    </Stack>
  );
};
