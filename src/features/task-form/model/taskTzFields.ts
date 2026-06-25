import {
  getContentStyleLabel,
  getUsageRightsLabel,
  type ContentStyle,
  type UsageRights,
} from '@/entities/post'

import {
  parseLegacyDeliverableLine,
  type TaskDeliverableFormItem,
} from './deliverablesMappers'

export type TaskTzListItem = { value: string }

export type TaskTzFields = {
  description: string
  dosAndDonts: string
  cta: string
  brandGuidelinesUrl: string
  deliverables: TaskDeliverableFormItem[]
  hashtagItems: TaskTzListItem[]
  mentionItems: TaskTzListItem[]
  referenceItems: TaskTzListItem[]
  locationCountry: string
  locationCity: string
  locationAddress: string
  locationShootingRequired: boolean
  cooperationExclusivity: boolean
  cooperationExclusivityDays: string
  cooperationUsageRights: string
  cooperationUsageDurationDays: string
  cooperationRequiresMarking: boolean
  cooperationRequiresContract: boolean
  cooperationNdaRequired: boolean
  bloggerMinFollowers: string
  bloggerMaxFollowers: string
  bloggerMinEngagementRate: string
  bloggerVerifiedAccount: boolean
  bloggerExperienceWithAds: boolean
  bloggerLanguages: TaskTzListItem[]
  bloggerContentStyles: TaskTzListItem[]
}

type ScalarFieldKey = {
  [K in keyof TaskTzFields]: TaskTzFields[K] extends string | boolean ? K : never
}[keyof TaskTzFields]

type ListFieldKey = {
  [K in keyof TaskTzFields]: TaskTzFields[K] extends TaskTzListItem[] ? K : never
}[keyof TaskTzFields]

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
    title: 'CTA',
    header: 'CTA',
    scalarFields: [{ key: 'cta', label: 'CTA' }],
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

const HEADER_TO_GROUP = Object.fromEntries(
  TASK_TZ_GROUPS.map(group => [group.header, group]),
) as Record<string, TaskTzGroup>

const DELIVERABLE_FIELDS = ['platform', 'format', 'count', 'durationSec'] as const

const isEmpty = (value?: string | null) => !value?.trim()

const BOOL_TRUE = '1'

const encodeBoolean = (value: boolean) => (value ? BOOL_TRUE : '')

const decodeBoolean = (value: string) =>
  value === BOOL_TRUE || value === 'true' || value === 'Да'

const encodeScalar = (_: ScalarFieldKey, value: TaskTzFields[ScalarFieldKey]): string => {
  if (typeof value === 'boolean') {
    return value ? encodeBoolean(true) : ''
  }

  return typeof value === 'string' ? value.trim() : ''
}

const decodeScalar = (
  _: ScalarFieldKey,
  value: string,
  field?: TaskTzScalarField,
): TaskTzFields[ScalarFieldKey] => {
  if (field?.type === 'boolean') {
    return decodeBoolean(value)
  }

  return value.trim()
}

const listToLines = (items: TaskTzListItem[]) =>
  items.map(item => item.value.trim()).filter(Boolean)

const linesToList = (body: string): TaskTzListItem[] =>
  body
    .split('\n')
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
    .map(value => ({ value }))

const serializeDeliverables = (deliverables: TaskDeliverableFormItem[]) => {
  const lines: string[] = []

  deliverables.forEach((item, index) => {
    if (!item.platform?.trim() || !item.format?.trim()) return

    lines.push(`deliverables[${index}].platform: ${item.platform.trim()}`)
    lines.push(`deliverables[${index}].format: ${item.format.trim()}`)
    lines.push(`deliverables[${index}].count: ${item.count?.trim() || '1'}`)

    if (item.durationSec?.trim()) {
      lines.push(`deliverables[${index}].durationSec: ${item.durationSec.trim()}`)
    }
  })

  return lines.join('\n')
}

const serializeGroupBody = (group: TaskTzGroup, form: TaskTzFields): string => {
  if (group.type === 'deliverables') {
    return serializeDeliverables(form.deliverables)
  }

  const lines: string[] = []

  group.scalarFields?.forEach(field => {
    const encoded = encodeScalar(field.key, form[field.key] as TaskTzFields[ScalarFieldKey])

    if (!encoded) return

    lines.push(`${field.key}: ${encoded}`)
  })

  group.listFields?.forEach(field => {
    const items = listToLines(form[field.key] as TaskTzListItem[])

    items.forEach((value, index) => {
      lines.push(`${field.key}[${index}]: ${value}`)
    })
  })

  return lines.join('\n')
}

const parseDeliverablesBody = (body: string, target: TaskTzFields) => {
  const deliverableBuffers = new Map<number, Partial<TaskDeliverableFormItem>>()
  const legacyContentBuffers = new Map<number, string>()

  body.split('\n').forEach(rawLine => {
    const line = rawLine.trim()

    if (!line) return

    const deliverableMatch = line.match(/^deliverables\[(\d+)\]\.([a-zA-Z]+):\s*(.*)$/)

    if (deliverableMatch) {
      const [, indexValue, fieldName, value] = deliverableMatch

      if (!DELIVERABLE_FIELDS.includes(fieldName as (typeof DELIVERABLE_FIELDS)[number])) {
        return
      }

      const index = Number(indexValue)
      const current = deliverableBuffers.get(index) ?? {}

      current[fieldName as (typeof DELIVERABLE_FIELDS)[number]] = value.trim()
      deliverableBuffers.set(index, current)
      return
    }

    const legacyContentMatch = line.match(/^contentItems\[(\d+)\]:\s*(.*)$/)

    if (legacyContentMatch) {
      legacyContentBuffers.set(Number(legacyContentMatch[1]), legacyContentMatch[2].trim())
    }
  })

  const parsedDeliverables = [...deliverableBuffers.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, item]) => ({
      platform: item.platform ?? '',
      format: item.format ?? '',
      count: item.count ?? '1',
      durationSec: item.durationSec ?? '',
    }))
    .filter(item => item.platform && item.format)

  if (parsedDeliverables.length) {
    target.deliverables = parsedDeliverables
    return
  }

  const legacyDeliverables = [...legacyContentBuffers.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, value]) => parseLegacyDeliverableLine(value))
    .filter((item): item is TaskDeliverableFormItem => Boolean(item))

  if (legacyDeliverables.length) {
    target.deliverables = legacyDeliverables
  }
}

const parseGroupBody = (group: TaskTzGroup, body: string, target: TaskTzFields) => {
  if (group.type === 'deliverables') {
    parseDeliverablesBody(body, target)
    return
  }

  const listBuffers = new Map<ListFieldKey, Map<number, string>>()

  body.split('\n').forEach(rawLine => {
    const line = rawLine.trim()

    if (!line) return

    const listMatch = line.match(/^([a-zA-Z]+)\[(\d+)\]:\s*(.*)$/)
    const scalarMatch = line.match(/^([a-zA-Z]+):\s*(.*)$/)

    if (listMatch) {
      const [, key, indexValue, value] = listMatch
      const listKey = key as ListFieldKey

      if (!group.listFields?.some(field => field.key === listKey)) return

      const index = Number(indexValue)
      const buffer = listBuffers.get(listKey) ?? new Map<number, string>()

      buffer.set(index, value.trim())
      listBuffers.set(listKey, buffer)
      return
    }

    if (!scalarMatch) return

    const [, key, value] = scalarMatch
    const scalarKey = key as ScalarFieldKey
    const field = group.scalarFields?.find(item => item.key === scalarKey)

    if (!field) return

    target[scalarKey] = decodeScalar(scalarKey, value, field) as never
  })

  group.listFields?.forEach(field => {
    const buffer = listBuffers.get(field.key)

    if (!buffer) return

    target[field.key] = [...buffer.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, value]) => ({ value })) as TaskTzFields[ListFieldKey]
  })
}

const parseLegacyListSection = (body: string): TaskTzListItem[] => linesToList(body)

const isStructuredBody = (body: string) =>
  body
    .split('\n')
    .some(line => /^[a-zA-Z]+(\[\d+\])?(\.[a-zA-Z]+)?:\s*/.test(line.trim()))

const parseLegacyLocationSection = (body: string, target: TaskTzFields) => {
  const text = body.replace(/^[-•]\s*/, '').trim()

  if (!text) return

  if (/съёмка на месте/i.test(text)) {
    target.locationShootingRequired = true
  }

  const parts = text
    .replace(/·\s*Нужна съёмка на месте/i, '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  target.locationCountry = parts[0] ?? ''
  target.locationCity = parts[1] ?? ''
  target.locationAddress = parts.slice(2).join(', ')
}

const parseLegacyCooperationSection = (body: string, target: TaskTzFields) => {
  const lines = body
    .split('\n')
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)

  lines.forEach(line => {
    if (/маркировка рекламы/i.test(line)) {
      target.cooperationRequiresMarking = true
      return
    }

    if (/^договор$/i.test(line)) {
      target.cooperationRequiresContract = true
      return
    }

    if (/^nda$/i.test(line)) {
      target.cooperationNdaRequired = true
      return
    }

    const exclusivityMatch = line.match(/^Эксклюзив(?::\s*(\d+)\s*дн\.?)?$/i)

    if (exclusivityMatch) {
      target.cooperationExclusivity = true

      if (exclusivityMatch[1]) {
        target.cooperationExclusivityDays = exclusivityMatch[1]
      }

      return
    }

    const durationMatch = line.match(/^(.+?),\s*(\d+)\s*дн\.?$/i)

    if (durationMatch) {
      target.cooperationUsageRights = durationMatch[1].trim()
      target.cooperationUsageDurationDays = durationMatch[2]
      return
    }

    target.cooperationUsageRights = line
  })
}

const parseLegacyBloggerSection = (body: string, target: TaskTzFields) => {
  const lines = body
    .split('\n')
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)

  lines.forEach(line => {
    const followersMatch = line.match(/^Подписчики:\s*(.*)$/i)

    if (followersMatch) {
      const minMatch = followersMatch[1].match(/от\s+([\d\s]+)/i)
      const maxMatch = followersMatch[1].match(/до\s+([\d\s]+)/i)

      if (minMatch) {
        target.bloggerMinFollowers = minMatch[1].replace(/\s/g, '')
      }

      if (maxMatch) {
        target.bloggerMaxFollowers = maxMatch[1].replace(/\s/g, '')
      }

      return
    }

    const erMatch = line.match(/^ER от\s+([\d.,]+)%?/i)

    if (erMatch) {
      target.bloggerMinEngagementRate = erMatch[1].replace(',', '.')
      return
    }

    if (/верифицирован/i.test(line)) {
      target.bloggerVerifiedAccount = true
      return
    }

    if (/опыт рекламы/i.test(line)) {
      target.bloggerExperienceWithAds = true
      return
    }

    const languagesMatch = line.match(/^Языки:\s*(.+)$/i)

    if (languagesMatch) {
      target.bloggerLanguages = languagesMatch[1]
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
        .map(value => ({ value }))
    }
  })
}

const parseLegacyGroupBody = (group: TaskTzGroup, body: string, target: TaskTzFields) => {
  if (group.header === 'Контент') {
    const legacyDeliverables = body
      .split('\n')
      .map(line => parseLegacyDeliverableLine(line))
      .filter((item): item is TaskDeliverableFormItem => Boolean(item))

    if (legacyDeliverables.length) {
      target.deliverables = legacyDeliverables
    }

    return
  }

  if (group.header === 'Хештеги') {
    target.hashtagItems = body
      .split(/[\s,]+/)
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => ({ value }))
    return
  }

  if (group.header === 'Упоминания') {
    target.mentionItems = body
      .split(/[\s,]+/)
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => ({ value }))
    return
  }

  if (group.header === 'Референсы') {
    target.referenceItems = parseLegacyListSection(body)
    return
  }

  if (group.header === 'Локация') {
    parseLegacyLocationSection(body, target)
    return
  }

  if (group.header === 'Условия сотрудничества') {
    parseLegacyCooperationSection(body, target)
    return
  }

  if (group.header === 'Требования к блогеру') {
    parseLegacyBloggerSection(body, target)
    return
  }

  if (group.scalarFields?.length === 1 && group.scalarFields[0].multiline) {
    target[group.scalarFields[0].key] = body.trim() as never
  }
}

export const createEmptyTaskTzFields = (): TaskTzFields => ({
  description: '',
  dosAndDonts: '',
  cta: '',
  brandGuidelinesUrl: '',
  deliverables: [],
  hashtagItems: [],
  mentionItems: [],
  referenceItems: [],
  locationCountry: '',
  locationCity: '',
  locationAddress: '',
  locationShootingRequired: false,
  cooperationExclusivity: false,
  cooperationExclusivityDays: '',
  cooperationUsageRights: '',
  cooperationUsageDurationDays: '',
  cooperationRequiresMarking: false,
  cooperationRequiresContract: false,
  cooperationNdaRequired: false,
  bloggerMinFollowers: '',
  bloggerMaxFollowers: '',
  bloggerMinEngagementRate: '',
  bloggerVerifiedAccount: false,
  bloggerExperienceWithAds: false,
  bloggerLanguages: [],
  bloggerContentStyles: [],
})

export const composeTaskDescription = (form: TaskTzFields): string => {
  const sections: string[] = []

  if (!isEmpty(form.description)) {
    sections.push(form.description.trim())
  }

  TASK_TZ_GROUPS.forEach(group => {
    const body = serializeGroupBody(group, form)

    if (!body) return

    sections.push(`## ${group.header}\n\n${body}`)
  })

  return sections.join('\n\n')
}

export const parseTaskDescription = (description?: string | null): TaskTzFields => {
  const parsed = createEmptyTaskTzFields()

  if (isEmpty(description)) {
    return parsed
  }

  const normalized = description!.trim()
  const parts = normalized.split(/\n## /)

  if (parts.length === 1) {
    parsed.description = normalized
    return parsed
  }

  parsed.description = parts[0].trim()

  for (let index = 1; index < parts.length; index += 1) {
    const part = parts[index]
    const newlineIndex = part.indexOf('\n')
    const header = newlineIndex === -1 ? part.trim() : part.slice(0, newlineIndex).trim()
    const body = newlineIndex === -1 ? '' : part.slice(newlineIndex + 1).trim()

    if (header === 'Задача' && body) {
      const taskText = isStructuredBody(body)
        ? body.replace(/^taskDescription:\s*/m, '').trim()
        : body.trim()

      parsed.description = [parsed.description, taskText].filter(Boolean).join('\n\n')
      continue
    }

    const group = HEADER_TO_GROUP[header]

    if (!group || !body) continue

    if (isStructuredBody(body)) {
      parseGroupBody(group, body, parsed)
    } else {
      parseLegacyGroupBody(group, body, parsed)
    }
  }

  return parsed
}

export const mapUsageRightsToForm = (rights?: UsageRights) =>
  rights ? getUsageRightsLabel(rights) : ''

export const mapContentStylesToForm = (styles?: ContentStyle[]) =>
  styles?.map(style => ({ value: getContentStyleLabel(style) })) ?? []

export type { TaskDeliverableFormItem } from './deliverablesMappers'
