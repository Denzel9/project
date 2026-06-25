import {
  PLACEMENT_FORMAT_LABELS,
  PLATFORM_LABELS,
  type PlacementFormat,
  type Platform,
  type PostDeliverable,
} from '@/entities/post'

export type TaskDeliverableFormItem = {
  platform: string
  format: string
  count: string
  durationSec: string
}

const findPlatformByLabel = (label: string): Platform | null => {
  const entry = Object.entries(PLATFORM_LABELS).find(
    ([, value]) => value === label.trim(),
  )

  return entry ? (entry[0] as Platform) : null
}

const findFormatByLabel = (label: string): PlacementFormat | null => {
  const entry = Object.entries(PLACEMENT_FORMAT_LABELS).find(
    ([, value]) => value === label.trim(),
  )

  return entry ? (entry[0] as PlacementFormat) : null
}

export const mapDeliverablesToForm = (
  deliverables?: PostDeliverable[],
): TaskDeliverableFormItem[] =>
  deliverables?.length
    ? deliverables.map(item => ({
        platform: item.platform,
        format: item.format,
        count: String(item.count),
        durationSec: item.durationSec != null ? String(item.durationSec) : '',
      }))
    : []

export const parseLegacyDeliverableLine = (
  line: string,
): TaskDeliverableFormItem | null => {
  const normalized = line.replace(/^[-•]\s*/, '').trim()
  const parts = normalized.split(' · ')

  if (parts.length < 3) return null

  const platform = findPlatformByLabel(parts[0])
  const format = findFormatByLabel(parts[1])

  if (!platform || !format) return null

  const countMatch = parts[2].match(/(\d+)\s*шт\./)
  const durationMatch = normalized.match(/,\s*(\d+)\s*сек\./)

  if (!countMatch) return null

  return {
    platform,
    format,
    count: countMatch[1],
    durationSec: durationMatch?.[1] ?? '',
  }
}

export const hasDeliverableValues = (
  deliverables?: TaskDeliverableFormItem[],
) => Boolean(deliverables?.some(item => item.platform && item.format))
