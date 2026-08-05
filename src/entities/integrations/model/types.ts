export const MESSENGER_PROVIDER = {
  TELEGRAM: 'TELEGRAM',
  MAX: 'MAX',
} as const

export type MessengerProvider =
  (typeof MESSENGER_PROVIDER)[keyof typeof MESSENGER_PROVIDER]

export type IntegrationProviderStatus = {
  provider: MessengerProvider
  configured: boolean
  connected: boolean
  username: string | null
  linkedAt: string | null
}

export type IntegrationsStatusResponse = {
  providers: IntegrationProviderStatus[]
}

export type IntegrationLinkResponse = {
  provider: MessengerProvider
  url: string
  expiresAt: string
}
