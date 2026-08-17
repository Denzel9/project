import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  appendMessagesToCache,
  chatKeys,
  fetchConversationMessages,
  getCachedConversationMessages,
  MESSAGES_PAGE_LIMIT,
  prependMessagesToCache,
  replaceMessagesInCache,
} from './api'
import {
  isMessageWindowDetached,
  setMessageWindowState,
  useMessageWindowState,
} from './messageWindowState'

import type { ChatMessage } from './types'

export const useLoadOlderChatMessages = (
  conversationId: string | null,
  historyMessages: ChatMessage[],
  _isHistoryLoading: boolean,
  markRead: boolean,
) => {
  const queryClient = useQueryClient()
  const windowState = useMessageWindowState(conversationId)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [isLoadingNewer, setIsLoadingNewer] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  const conversationIdRef = useRef(conversationId)

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    setIsLoadingOlder(false)
    setIsLoadingNewer(false)
    setIsJumping(false)
  }, [conversationId])

  const getCached = useCallback(() => {
    if (!conversationId) return []

    const cached = getCachedConversationMessages(queryClient, conversationId)

    if (cached.length) return cached

    return (
      queryClient.getQueryData<ChatMessage[]>(
        chatKeys.messages(conversationId, undefined, markRead),
      ) ?? historyMessages
    )
  }, [conversationId, historyMessages, markRead, queryClient])

  const loadOlder = useCallback(async () => {
    if (!conversationId || isLoadingOlder || !windowState.hasOlder) return

    const cached = getCached()
    const oldest = cached[0]

    if (!oldest) return

    setIsLoadingOlder(true)

    try {
      const page = await fetchConversationMessages(conversationId, {
        cursor: oldest.id,
        limit: MESSAGES_PAGE_LIMIT,
        markRead: false,
      })

      if (conversationIdRef.current !== conversationId) return

      prependMessagesToCache(queryClient, conversationId, page.items)
      setMessageWindowState(conversationId, {
        hasOlder: page.hasOlder,
      })
    } catch {
      if (conversationIdRef.current === conversationId) {
        setMessageWindowState(conversationId, { hasOlder: false })
      }
    } finally {
      if (conversationIdRef.current === conversationId) {
        setIsLoadingOlder(false)
      }
    }
  }, [
    conversationId,
    getCached,
    isLoadingOlder,
    queryClient,
    windowState.hasOlder,
  ])

  const loadNewer = useCallback(async () => {
    if (!conversationId || isLoadingNewer || !windowState.hasNewer) return

    const cached = getCached()
    const newest = cached.at(-1)

    if (!newest) return

    setIsLoadingNewer(true)

    try {
      const page = await fetchConversationMessages(conversationId, {
        after: newest.id,
        limit: MESSAGES_PAGE_LIMIT,
        markRead: false,
      })

      if (conversationIdRef.current !== conversationId) return

      appendMessagesToCache(queryClient, conversationId, page.items)
      setMessageWindowState(conversationId, {
        hasNewer: page.hasNewer,
        detached: page.hasNewer,
      })
    } catch {
      if (conversationIdRef.current === conversationId) {
        setMessageWindowState(conversationId, {
          hasNewer: false,
          detached: false,
        })
      }
    } finally {
      if (conversationIdRef.current === conversationId) {
        setIsLoadingNewer(false)
      }
    }
  }, [
    conversationId,
    getCached,
    isLoadingNewer,
    queryClient,
    windowState.hasNewer,
  ])

  const jumpToMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return false

      const cached = getCached()

      if (cached.some(message => message.id === messageId)) {
        return true
      }

      setIsJumping(true)

      try {
        const page = await fetchConversationMessages(conversationId, {
          around: messageId,
          limit: MESSAGES_PAGE_LIMIT,
          markRead: false,
        })

        if (conversationIdRef.current !== conversationId) return false

        replaceMessagesInCache(queryClient, conversationId, page.items)
        setMessageWindowState(conversationId, {
          hasOlder: page.hasOlder,
          hasNewer: page.hasNewer,
          detached: page.hasNewer,
        })

        return page.items.some(message => message.id === messageId)
      } catch {
        return false
      } finally {
        if (conversationIdRef.current === conversationId) {
          setIsJumping(false)
        }
      }
    },
    [conversationId, getCached, queryClient],
  )

  const resetToTail = useCallback(async () => {
    if (!conversationId) return

    setIsJumping(true)

    try {
      const page = await fetchConversationMessages(conversationId, {
        limit: MESSAGES_PAGE_LIMIT,
        markRead,
      })

      if (conversationIdRef.current !== conversationId) return

      replaceMessagesInCache(queryClient, conversationId, page.items)
      setMessageWindowState(conversationId, {
        hasOlder: page.hasOlder,
        hasNewer: false,
        detached: false,
      })
    } finally {
      if (conversationIdRef.current === conversationId) {
        setIsJumping(false)
      }
    }
  }, [conversationId, markRead, queryClient])

  return {
    hasOlder: windowState.hasOlder,
    hasNewer: windowState.hasNewer,
    isDetached:
      windowState.detached ||
      isMessageWindowDetached(conversationId ?? ''),
    isLoadingOlder,
    isLoadingNewer,
    isJumping,
    loadOlder,
    loadNewer,
    jumpToMessage,
    resetToTail,
  }
}
