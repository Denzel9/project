import {
  getContentStyleLabel,
  getUsageRightsLabel,
  type ContentStyle,
  type UsageRights,
} from '@/entities/post'

import { hasDeliverableValues } from './deliverablesMappers'

import type { TaskFormType } from './schema/schema'

type ScalarFieldKey = {
  [K in keyof TaskFormType]: TaskFormType[K] extends string | boolean ? K : never
}[keyof TaskFormType]

type ListFieldKey = {
  [K in keyof TaskFormType]: TaskFormType[K] extends Array<infer U>
  ? U extends { value?: string }
  ? K
  : never
  : never
}[keyof TaskFormType]

export type TaskTzScalarField = {
  key: ScalarFieldKey
  label: string
  multiline?: boolean
  type?: 'text' | 'boolean'
}

export type TaskTzListField = {
  key: ListFieldKey
  label: string
  itemLabel: string
}

export type TaskTzGroup = {
  title: string
  header: string
  type?: 'deliverables'
  scalarFields?: TaskTzScalarField[]
  listFields?: TaskTzListField[]
}

export const TASK_TZ_GROUPS: TaskTzGroup[] = [
  {
    title: 'Контент',
    header: 'Контент',
    type: 'deliverables',
  },
  {
    title: 'Можно / нельзя',
    header: 'Можно / нельзя',
    scalarFields: [{ key: 'dosAndDonts', label: 'Можно / нельзя', multiline: true }],
  },
  {
    title: 'Призыв к действию',
    header: 'Призыв к действию',
    scalarFields: [{ key: 'cta', label: 'Призыв к действию' }],
  },
  {
    title: 'Хештеги',
    header: 'Хештеги',
    listFields: [{ key: 'hashtagItems', label: 'Хештеги', itemLabel: 'Хештег' }],
  },
  {
    title: 'Упоминания',
    header: 'Упоминания',
    listFields: [{ key: 'mentionItems', label: 'Упоминания', itemLabel: 'Упоминание' }],
  },
  {
    title: 'Референсы',
    header: 'Референсы',
    listFields: [{ key: 'referenceItems', label: 'Референсы', itemLabel: 'Ссылка' }],
  },
  {
    title: 'Гайдлайны',
    header: 'Гайдлайны',
    scalarFields: [{ key: 'brandGuidelinesUrl', label: 'Гайдлайны' }],
  },
]

export const mapUsageRightsToForm = (rights?: UsageRights) =>
  rights ? getUsageRightsLabel(rights) : ''

export const mapContentStylesToForm = (styles?: ContentStyle[]) =>
  styles?.map(style => ({ value: getContentStyleLabel(style) })) ?? []



export const isEmptyValue = (value: unknown) => {
  if (typeof value === 'boolean') return !value
  if (typeof value === 'string') return !value.trim()
  if (Array.isArray(value)) {
    return !value.some(item => {
      if (typeof item === 'object' && item && 'value' in item) {
        return Boolean((item as { value?: string }).value?.trim())
      }

      return false
    })
  }

  return true
}

export const groupHasValue = (group: TaskTzGroup, values: TaskFormType) => {
  if (group.type === 'deliverables') {
    return hasDeliverableValues(values.deliverables)
  }

  const scalarFilled = group.scalarFields?.some(
    field => !isEmptyValue(values[field.key]),
  )
  const listFilled = group.listFields?.some(field => {
    const items = values[field.key] as { value?: string }[] | undefined
    return items?.some(item => item.value?.trim())
  })

  return Boolean(scalarFilled || listFilled)
}

export const formatBooleanValue = (value: boolean) => (value ? 'Да' : 'Нет')

