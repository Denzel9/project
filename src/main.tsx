import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { BrowserRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import App from './App.tsx'
import { initSentry } from './shared/lib/sentry'
import { useSnackbarStore } from './widgets/snackbar/model/store'

initSentry()

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
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        Что-то пошло не так. Обновите страницу или попробуйте позже.
      </div>
    }
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Sentry.ErrorBoundary>,
)
