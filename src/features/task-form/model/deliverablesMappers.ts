import type { PostDeliverable } from '@/entities/post'

export type TaskDeliverableFormItem = {
  platform: string
  format: string
  count: string
  durationSec: string
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

export const hasDeliverableValues = (
  deliverables?: TaskDeliverableFormItem[],
) => Boolean(deliverables?.some(item => item.platform && item.format))
