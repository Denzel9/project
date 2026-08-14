import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'

import {
  MESSENGER_PROVIDER,
  useCreateIntegrationLinkMutation,
  useIntegrationsStatusQuery,
  useUnlinkIntegrationMutation,
  type IntegrationProviderStatus,
  type MessengerProvider,
} from '@/entities/integrations'
import { useAuthStore } from '@/features'
import { EmptyBlock } from '@/shared'
import { useSnackbarStore } from '@/widgets'

import { SettingsRow } from '../SettingsRow'

const PROVIDER_META: Record<
  MessengerProvider,
  { title: string; description: string }
> = {
  TELEGRAM: {
    title: 'Telegram',
    description:
      'Уведомления о откликах, задачах и сообщениях в Telegram-боте Nikssens.',
  },
  MAX: {
    title: 'MAX',
    description:
      'Те же события в мессенджере MAX — удобно командам в экосистеме VK.',
  },
}

const ProviderCard = ({
  status,
  isBusy,
  onConnect,
  onDisconnect,
}: {
  status: IntegrationProviderStatus
  isBusy: boolean
  onConnect: () => void
  onDisconnect: () => void
}) => {
  const meta = PROVIDER_META[status.provider]

  let stateLabel = 'Не подключено'
  let stateColor: 'default' | 'success' | 'warning' = 'default'

  if (!status.configured) {
    stateLabel = 'Не настроен на сервере'
    stateColor = 'warning'
  } else if (status.connected) {
    stateLabel = status.username ? `@${status.username}` : 'Подключено'
    stateColor = 'success'
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <SettingsRow
        title={meta.title}
        description={meta.description}
        action={
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <Chip size="small" label={stateLabel} color={stateColor} />
            {status.configured && status.connected ? (
              <Button
                variant="outlined"
                color="inherit"
                disabled={isBusy}
                sx={{ px: 2 }}
                onClick={onDisconnect}
              >
                Отключить
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={!status.configured || isBusy}
                sx={{ px: 2 }}
                onClick={onConnect}
                startIcon={
                  isBusy ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : undefined
                }
              >
                Подключить
              </Button>
            )}
          </Stack>
        }
      />
    </Box>
  )
}

export const SettingsAppsPage = () => {
  const { isAuth } = useAuthStore()
  const { setSnackbarOpen } = useSnackbarStore()

  const { data, isLoading, isError, refetch } = useIntegrationsStatusQuery({
    enabled: isAuth,
  })

  const { mutateAsync: createLink, isPending: isLinking } =
    useCreateIntegrationLinkMutation()
  const { mutateAsync: unlink, isPending: isUnlinking } =
    useUnlinkIntegrationMutation()

  const byProvider = useMemo(() => {
    const map = new Map<MessengerProvider, IntegrationProviderStatus>()
    for (const item of data?.providers ?? []) {
      map.set(item.provider, item)
    }
    return map
  }, [data])

  const providers = [
    byProvider.get(MESSENGER_PROVIDER.TELEGRAM) ?? {
      provider: MESSENGER_PROVIDER.TELEGRAM,
      configured: false,
      connected: false,
      username: null,
      linkedAt: null,
    },
    byProvider.get(MESSENGER_PROVIDER.MAX) ?? {
      provider: MESSENGER_PROVIDER.MAX,
      configured: false,
      connected: false,
      username: null,
      linkedAt: null,
    },
  ]

  const handleConnect = async (provider: MessengerProvider) => {
    try {
      const link = await createLink(provider)
      window.open(link.url, '_blank', 'noopener,noreferrer')
      setSnackbarOpen(
        true,
        'Откройте бота и нажмите Start — затем обновите статус',
      )
      window.setTimeout(() => {
        void refetch()
      }, 2500)
    } catch {
      setSnackbarOpen(true, 'Не удалось создать ссылку подключения')
    }
  }

  const handleDisconnect = async (provider: MessengerProvider) => {
    try {
      await unlink(provider)
      setSnackbarOpen(true, 'Интеграция отключена')
    } catch {
      setSnackbarOpen(true, 'Не удалось отключить интеграцию')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <EmptyBlock
          title="Не удалось загрузить приложения"
          buttonText="Повторить"
          buttonOnClick={() => void refetch()}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Приложения
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => void refetch()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Обновить статус
        </Button>
      </Stack>

      <Typography variant="body2" color="info" sx={{ mb: 4, mt: 2 }}>
        Подключите Telegram или MAX, чтобы получать уведомления Nikssens в
        мессенджере. Типы событий настраиваются в разделе «Уведомления».
      </Typography>

      <Stack spacing={2}>
        {providers.map(status => (
          <ProviderCard
            key={status.provider}
            status={status}
            isBusy={isLinking || isUnlinking}
            onConnect={() => void handleConnect(status.provider)}
            onDisconnect={() => void handleDisconnect(status.provider)}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default SettingsAppsPage
