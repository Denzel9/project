import { Box, Button, Stack, Typography } from '@mui/material'
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import './index.css'
import { registerSW } from 'virtual:pwa-register'

import App from './App.tsx'
import { initSentry } from './shared/lib/sentry'
import { useSnackbarStore } from './widgets/snackbar/model/store'

initSentry()

const hideAppSplash = () => {
  const splash = document.getElementById('app-splash')
  if (!splash) return

  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 280)
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    useSnackbarStore.getState().setSnackbarOpen(
      true,
      'Доступна новая версия приложения',
      'info',
      {
        actionLabel: 'Обновить',
        autoHideDuration: null,
        onAction: () => {
          void updateSW(true)
        },
      },
    )
  },
  onOfflineReady() {
    useSnackbarStore
      .getState()
      .setSnackbarOpen(true, 'Приложение готово к работе офлайн', 'success')
  },
})

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary
    fallback={
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <img src="/Primary.png" alt="error" width={277} height={64} style={{ position: 'absolute', top: 32, left: 32 }} />

        <Stack direction='column' spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant='h5'>Что-то пошло не так</Typography>
          <Typography variant='body1'>Обновите страницу или попробуйте позже</Typography>

          <Button
            variant='text'
            color='inherit'
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </Button>
        </Stack>
      </Box>
    }
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Sentry.ErrorBoundary>,
)

requestAnimationFrame(() => {
  requestAnimationFrame(hideAppSplash)
})

