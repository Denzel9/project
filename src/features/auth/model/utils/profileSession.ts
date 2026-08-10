import {
  resetIncomingChatMessageClaims,
  setActiveChatConversationId,
  setChatUnreadHoldConversationId,
} from '@/entities/chat'
import { prefetchUserConfig } from '@/entities/user-config'
import { useMyTaskFilterStore } from '@/features/task-filter/model/store'
import { queryClient } from '@/shared/api'
import chatSocket from '@/shared/api/socket'
import notificationsSocket from '@/shared/api/notificationsSocket'
import taskCommentsSocket from '@/shared/api/taskCommentsSocket'
import { ROUTES } from '@/shared/config/routes'
import { useApplicationItemStore } from '@/widgets/post-item/model/store'

import { useAuthStore } from '../store/store'
import { mapAuthSessionUser } from './mapAuthSessionUser'

import type { AuthSessionUser } from '../types/types'

const PROFILE_SWITCH_CHANNEL = 'nikssens-profile-switch'
const PROFILE_SWITCH_TOKEN_KEY = 'nikssens-profile-switch-token'

const resetRealtimeConnections = () => {
  chatSocket.removeListeners()
  chatSocket.disconnect()
  notificationsSocket.removeListeners()
  notificationsSocket.disconnect()
  taskCommentsSocket.removeListeners()
  taskCommentsSocket.disconnect()
}

const resetClientStores = () => {
  useMyTaskFilterStore.getState().resetForProfileSwitch()
  useApplicationItemStore
    .getState()
    .setOpenAddToCollectionDialog(false, null)
  setActiveChatConversationId(null)
  setChatUnreadHoldConversationId(null)
  resetIncomingChatMessageClaims()
}

const broadcastProfileSwitched = (userId: string) => {
  if (typeof BroadcastChannel === 'undefined') return

  try {
    const token = crypto.randomUUID()
    sessionStorage.setItem(PROFILE_SWITCH_TOKEN_KEY, token)
    const channel = new BroadcastChannel(PROFILE_SWITCH_CHANNEL)
    channel.postMessage({ type: 'profile-switched', userId, token })
    channel.close()
  } catch {
    // BroadcastChannel may be unavailable
  }
}

/** Сброс кэша/сторов/сокетов под новый профиль. Вызывать после setAuth. */
export const resetProfileScopedClientState = () => {
  resetRealtimeConnections()
  queryClient.clear()
  resetClientStores()
}

/**
 * Полное применение смены профиля: auth → очистка клиента → prefetch config → sync вкладок.
 */
export const applySwitchedProfileSession = async (
  user: AuthSessionUser | (Partial<AuthSessionUser> & {
    id: string
    accountId: string
    role: string
    membershipRole: string
  }),
) => {
  const mapped = mapAuthSessionUser(user)

  useAuthStore.getState().setAuth(mapped)
  resetProfileScopedClientState()

  try {
    await prefetchUserConfig(queryClient)
  } catch {
    // конфиг подтянется при следующем обращении
  }

  broadcastProfileSwitched(mapped.id)

  return mapped
}

/** Другие вкладки: полный reload, чтобы подхватить новый JWT/профиль. */
export const subscribeRemoteProfileSwitch = () => {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined
  }

  let channel: BroadcastChannel

  try {
    channel = new BroadcastChannel(PROFILE_SWITCH_CHANNEL)
  } catch {
    return () => undefined
  }

  const onMessage = (event: MessageEvent) => {
    const data = event.data as {
      type?: string
      token?: string
    } | null

    if (!data || data.type !== 'profile-switched') return

    const ownToken = sessionStorage.getItem(PROFILE_SWITCH_TOKEN_KEY)

    if (data.token && data.token === ownToken) {
      return
    }

    window.location.assign(ROUTES.INDEX)
  }

  channel.addEventListener('message', onMessage)

  return () => {
    channel.removeEventListener('message', onMessage)
    channel.close()
  }
}
