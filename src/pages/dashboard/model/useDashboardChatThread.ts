import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import {
  appendMessageToCache,
  chatKeys,
  setConversationUnreadCount,
  uploadConversationMediaBatch,
  useMessagesQuery,
  type ChatMessage,
} from '@/entities/chat'
import chatSocket from '@/shared/api/socket'

type UseDashboardChatThreadParams = {
  conversationId: string | null
}

export const useDashboardChatThread = ({
  conversationId,
}: UseDashboardChatThreadParams) => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useMessagesQuery(conversationId)

  useEffect(() => {
    setDraft('')
    setPendingFiles([])
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return

    chatSocket.connect()
    chatSocket.joinConversation(conversationId)
    setConversationUnreadCount(queryClient, conversationId, 0)

    const handleMessage = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) return

      appendMessageToCache(queryClient, conversationId, message)
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
    }

    chatSocket.onMessage(handleMessage)

    return () => {
      chatSocket.onMessage(() => undefined)
    }
  }, [conversationId, queryClient])

  const attachFiles = useCallback((files: File[]) => {
    if (!files.length) return

    setPendingFiles(current => [...current, ...files])
  }, [])

  const removeFile = useCallback((index: number) => {
    setPendingFiles(current => current.filter((_, i) => i !== index))
  }, [])

  const sendMessage = useCallback(async () => {
    if (!conversationId) return false

    const content = draft.trim()
    const hasContent = Boolean(content)
    const hasFiles = pendingFiles.length > 0

    if (!hasContent && !hasFiles) return false

    try {
      setIsSending(true)
      chatSocket.connect()
      chatSocket.joinConversation(conversationId)

      const media = hasFiles
        ? await uploadConversationMediaBatch(conversationId, pendingFiles)
        : undefined

      chatSocket.sendMessage({
        conversationId,
        content: hasContent ? content : undefined,
        media,
      })

      setDraft('')
      setPendingFiles([])
      return true
    } catch {
      return false
    } finally {
      setIsSending(false)
    }
  }, [conversationId, draft, pendingFiles])

  return {
    messages,
    isLoading,
    isError,
    refetch,
    draft,
    setDraft,
    pendingFiles,
    attachFiles,
    removeFile,
    sendMessage,
    isSending,
  }
}
