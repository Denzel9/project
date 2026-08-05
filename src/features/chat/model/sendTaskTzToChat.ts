import { format } from 'date-fns'

import {
  copyTaskMediaToConversation,
  wrapChatTaskTzMessage,
  type ChatConversation,
  type CreateConversationDto,
} from '@/entities/chat'
import {
  formatBloggerRequirements,
  formatCooperationDetails,
  formatPostDeliverable,
} from '@/entities/post'
import { fetchTaskById, type Task } from '@/entities/task'
import { mapTaskToTaskForm } from '@/features/task-form/model/postDefaults'
import { mapDeliverablesFromTaskForm } from '@/features/task-form/model/taskFormFieldMappers'
import chatSocket from '@/shared/api/socket'

const getTaskTzTitle = (task: Task) =>
  task.title?.trim() || task.post?.title?.trim() || 'Задача'

const appendSection = (parts: string[], title: string, body: string) => {
  if (!body.trim()) {
    return
  }

  parts.push(`## ${title}\n\n${body.trim()}`)
}

const appendListSection = (parts: string[], title: string, items: string[]) => {
  if (!items.length) {
    return
  }

  parts.push(`## ${title}\n\n${items.map(item => `- ${item}`).join('\n')}`)
}

export const formatTaskTzForChat = (task: Task): string => {
  const form = mapTaskToTaskForm(task)
  const title = getTaskTzTitle(task)
  const parts: string[] = [`# ТЗ: ${title}`]

  if (form.description?.trim()) {
    appendSection(parts, 'Описание', form.description)
  }

  const params: string[] = []

  if (form.photoCount?.trim()) {
    params.push(`**Фото:** ${form.photoCount}`)
  }

  if (form.videoCount?.trim()) {
    params.push(`**Видео:** ${form.videoCount}`)
  }

  if (form.finalDate) {
    params.push(
      `**Дедлайн:** ${format(new Date(form.finalDate), 'dd.MM.yyyy HH:mm')}`,
    )
  }

  if (params.length) {
    appendSection(parts, 'Параметры', params.join('\n'))
  }

  const deliverables = mapDeliverablesFromTaskForm(form)

  if (deliverables?.length) {
    appendListSection(
      parts,
      'Контент',
      deliverables.map(formatPostDeliverable),
    )
  }

  if (form.dosAndDonts?.trim()) {
    appendSection(parts, 'Можно / нельзя', form.dosAndDonts)
  }

  if (form.cta?.trim()) {
    appendSection(parts, 'Призыв к действию', form.cta)
  }

  const hashtags =
    form.hashtagItems
      ?.map(item => item.value?.trim())
      .filter((value): value is string => Boolean(value)) ?? []

  if (hashtags.length) {
    appendListSection(parts, 'Хештеги', hashtags)
  }

  const mentions =
    form.mentionItems
      ?.map(item => item.value?.trim())
      .filter((value): value is string => Boolean(value)) ?? []

  if (mentions.length) {
    appendListSection(parts, 'Упоминания', mentions)
  }

  const references =
    form.referenceItems
      ?.map(item => item.value?.trim())
      .filter((value): value is string => Boolean(value)) ?? []

  if (references.length) {
    appendListSection(parts, 'Референсы', references)
  }

  if (form.brandGuidelinesUrl?.trim()) {
    appendSection(parts, 'Гайдлайны', form.brandGuidelinesUrl)
  }

  const cooperationLines = formatCooperationDetails(
    task.cooperationDetails ?? undefined,
  )

  if (cooperationLines.length) {
    appendListSection(parts, 'Условия сотрудничества', cooperationLines)
  }

  const bloggerLines = formatBloggerRequirements(
    task.bloggerRequirements ?? undefined,
  )

  if (bloggerLines.length) {
    appendListSection(parts, 'Требования к блогеру', bloggerLines)
  }

  if (parts.length === 1) {
    parts.push('\n_Техническое задание не заполнено._')
  }

  return parts.join('\n\n')
}

type SendTaskTzToChatParams = {
  taskId: string
  peerId: string
  conversations?: ChatConversation[]
  createConversation: (
    body: CreateConversationDto,
  ) => Promise<ChatConversation>
  task?: Task
  /** Default true — attach MAIN task media via server copy */
  attachMedia?: boolean
}

export const sendTaskTzToChat = async ({
  taskId,
  peerId,
  conversations,
  createConversation,
  task,
  attachMedia = true,
}: SendTaskTzToChatParams): Promise<boolean> => {
  const fullTask = task?.id === taskId ? task : await fetchTaskById(taskId)
  // List payloads may omit media — refetch so attachments are included
  const taskWithMedia =
    attachMedia && fullTask.media === undefined
      ? await fetchTaskById(taskId)
      : fullTask

  const markdown = formatTaskTzForChat(taskWithMedia)
  const content = wrapChatTaskTzMessage(taskWithMedia.id, markdown)

  const existing = conversations?.find(
    conversation => conversation.peer.id === peerId,
  )
  const conversation =
    existing ?? (await createConversation({ recipientId: peerId }))

  const shouldAttachMedia = attachMedia && Boolean(taskWithMedia.media?.length)

  const media = shouldAttachMedia
    ? await copyTaskMediaToConversation({
        taskId: taskWithMedia.id,
        conversationId: conversation.id,
        kind: 'main',
      })
    : undefined

  chatSocket.connect()
  chatSocket.joinConversation(conversation.id)
  chatSocket.sendMessage({
    conversationId: conversation.id,
    content,
    ...(media?.length ? { media } : {}),
  })

  return true
}
