import dayjs from 'dayjs'

import { ROUTES } from '@/shared'

import { DEFAULT_CALENDAR_FILTERS } from './constants'

import type {
  CalendarEventTypeFilter,
  CalendarFiltersState,
  CalendarPostMeta,
} from './types'
import type { TaskCalendarItem } from '@/entities'
import type { SxProps, Theme } from '@mui/material'

export type CalendarEventType = 'created' | 'deadline'

export type DateCategory = 'past' | 'today' | 'future'

export type CalendarEvent = {
  task: TaskCalendarItem
  type: CalendarEventType
  dateKey: string
}

export type CalendarDayStats = {
  total: number
  deadlines: number
  created: number
  overdue: number
  urgent: number
}

export type CalendarMonthStats = {
  total: number
  deadlines: number
  overdue: number
  created: number
  urgent: number
  daysWithEvents: number
}

export const toDateKey = (iso: string) => dayjs(iso).format('YYYY-MM-DD')

export const toCalendarDateKey = (date: dayjs.Dayjs) =>
  date.format('YYYY-MM-DD')

export const getDateCategory = (dateKey: string): DateCategory => {
  const date = dayjs(dateKey).startOf('day')
  const today = dayjs().startOf('day')

  if (date.isBefore(today)) return 'past'
  if (date.isAfter(today)) return 'future'

  return 'today'
}

export const getEventLabel = (
  type: CalendarEventType,
  dateKey?: string,
) => {
  const isToday = dateKey === dayjs().format('YYYY-MM-DD')

  if (type === 'deadline') {
    return isToday ? 'Дедлайн сегодня' : 'Дедлайн в этот день'
  }

  return isToday ? 'Создана сегодня' : 'Создана'
}

export const isCalendarTaskOverdue = (task: TaskCalendarItem) =>
  Boolean(task.finalDate) &&
  dayjs(task.finalDate).isBefore(dayjs(), 'day')

export const getCalendarTaskPath = (task: TaskCalendarItem) => {
  const userId = task.executor?.id || 'unassigned'
  const params = new URLSearchParams({
    userId,
    taskId: task.id,
  })

  return `${ROUTES.TASK}/${task.postId}?${params.toString()}`
}

export const buildCalendarPostMetaMap = (
  tasks: TaskCalendarItem[],
): Map<string, CalendarPostMeta> => {
  const map = new Map<string, CalendarPostMeta>()

  tasks.forEach(task => {
    map.set(task.id, {
      platforms: task.platforms ?? [],
      placementFormats: task.placementFormats ?? [],
    })
  })

  return map
}

export const filterCalendarTasksByPostMeta = (
  tasks: TaskCalendarItem[],
  metaMap: Map<string, CalendarPostMeta>,
  {
    platform,
    placementFormat,
  }: Pick<CalendarFiltersState, 'platform' | 'placementFormat'>,
) => {
  if (platform === 'all' && placementFormat === 'all') {
    return tasks
  }

  return tasks.filter(task => {
    const meta = metaMap.get(task.id)

    if (!meta) return false

    if (platform !== 'all' && !meta.platforms.includes(platform)) {
      return false
    }

    if (
      placementFormat !== 'all' &&
      !meta.placementFormats.includes(placementFormat)
    ) {
      return false
    }

    return true
  })
}

export const buildCalendarEvents = (
  tasks: TaskCalendarItem[],
  eventType: CalendarEventTypeFilter = 'all',
): CalendarEvent[] => {
  const events: CalendarEvent[] = []

  tasks.forEach(task => {
    const createdDateKey = toDateKey(task.createdAt)

    if (eventType === 'all' || eventType === 'created') {
      events.push({
        task,
        type: 'created',
        dateKey: createdDateKey,
      })
    }

    if (task.finalDate && (eventType === 'all' || eventType === 'deadline')) {
      const deadlineDateKey = toDateKey(task.finalDate)

      if (deadlineDateKey !== createdDateKey || eventType === 'deadline') {
        events.push({
          task,
          type: 'deadline',
          dateKey: deadlineDateKey,
        })
      }
    }
  })

  return events
}

export const filterEventsInMonthRange = (
  events: CalendarEvent[],
  dateFrom: string,
  dateTo: string,
) =>
  events.filter(event => event.dateKey >= dateFrom && event.dateKey <= dateTo)

export const groupEventsByDate = (events: CalendarEvent[]) => {
  const map = new Map<string, CalendarEvent[]>()

  events.forEach(event => {
    const existing = map.get(event.dateKey) ?? []
    map.set(event.dateKey, [...existing, event])
  })

  return map
}

export const sortCalendarEvents = (events: CalendarEvent[]) =>
  [...events].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'deadline' ? -1 : 1
    }

    if (left.task.urgent !== right.task.urgent) {
      return left.task.urgent ? -1 : 1
    }

    const leftTitle = left.task.title ?? ''
    const rightTitle = right.task.title ?? ''

    return leftTitle.localeCompare(rightTitle, 'ru')
  })

export const hasOverdueDeadlineOnDate = (
  events: CalendarEvent[],
  dateKey: string,
) =>
  events.some(
    event =>
      event.dateKey === dateKey &&
      event.type === 'deadline' &&
      isCalendarTaskOverdue(event.task),
  )

const emptyDayStats = (): CalendarDayStats => ({
  total: 0,
  deadlines: 0,
  created: 0,
  overdue: 0,
  urgent: 0,
})

export const getCalendarDayStats = (
  events: CalendarEvent[],
  dateKey?: string,
): CalendarDayStats => {
  const dayEvents = dateKey
    ? events.filter(event => event.dateKey === dateKey)
    : events

  return dayEvents.reduce<CalendarDayStats>((acc, event) => {
    acc.total += 1

    if (event.type === 'deadline') {
      acc.deadlines += 1

      if (isCalendarTaskOverdue(event.task)) {
        acc.overdue += 1
      }
    } else {
      acc.created += 1
    }

    if (event.task.urgent) {
      acc.urgent += 1
    }

    return acc
  }, emptyDayStats())
}

export const getCalendarMonthStats = (
  events: CalendarEvent[],
): CalendarMonthStats => {
  const dayStats = getCalendarDayStats(events)
  const daysWithEvents = new Set(events.map(event => event.dateKey)).size

  return {
    ...dayStats,
    daysWithEvents,
  }
}

const pluralRu = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few

  return many
}

export const getCalendarDayTooltip = (
  stats: CalendarDayStats,
  options?: { isToday?: boolean },
) => {
  if (stats.total === 0) {
    return 'Нет событий'
  }

  const parts: string[] = []
  const deadlineSuffix = options?.isToday ? ' сегодня' : ' в этот день'

  if (stats.deadlines > 0) {
    parts.push(
      `${stats.deadlines} ${pluralRu(stats.deadlines, 'дедлайн', 'дедлайна', 'дедлайнов')}${deadlineSuffix}`,
    )
  }

  if (stats.created > 0) {
    parts.push(
      `${stats.created} ${pluralRu(stats.created, 'создана', 'созданы', 'создано')}`,
    )
  }

  if (stats.overdue > 0) {
    parts.push(`просрочено: ${stats.overdue}`)
  }

  if (stats.urgent > 0) {
    parts.push(`срочных: ${stats.urgent}`)
  }

  return parts.join(' · ')
}

export const findNearestDayWithEvents = (
  events: CalendarEvent[],
  fromDateKey: string,
): string | null => {
  if (!events.length) {
    return null
  }

  const uniqueKeys = [...new Set(events.map(event => event.dateKey))].sort()

  const next = uniqueKeys.find(key => key > fromDateKey)

  if (next) {
    return next
  }

  const before = [...uniqueKeys].reverse().find(key => key < fromDateKey)

  return before ?? null
}

export const getCalendarDaySx = (
  dateKey: string,
  selected = false,
): SxProps<Theme> => {
  const category = getDateCategory(dateKey)

  return {
    margin: 0,
    fontWeight: category === 'today' ? 700 : 500,
    border:
      category === 'today' && !selected
        ? theme => `1px solid ${theme.palette.primary.main}`
        : undefined,
  }
}

export const hasActiveCalendarFilters = (value: CalendarFiltersState) =>
  value.eventType !== DEFAULT_CALENDAR_FILTERS.eventType ||
  value.urgentOnly !== DEFAULT_CALENDAR_FILTERS.urgentOnly ||
  value.companyId !== DEFAULT_CALENDAR_FILTERS.companyId ||
  value.platform !== DEFAULT_CALENDAR_FILTERS.platform ||
  value.placementFormat !== DEFAULT_CALENDAR_FILTERS.placementFormat;
