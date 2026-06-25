import type {
  BudgetType,
  ContentStyle,
  PaymentTerms,
  PlacementFormat,
  Platform,
  PostBudget,
  PostDeliverable,
  PostMedia,
  PostType,
  UsageRights,
  WorkFormat,
} from './types'
import type { Application } from '@/entities/application'
import type { Photo } from '@/entities/photo'

export const getPostTypeLabel = (type: PostType): string =>
  type === 'COMPANY' ? 'Компания' : 'Креатор'

export const PLATFORM_LABELS: Record<Platform, string> = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  TELEGRAM: 'Telegram',
  VK: 'ВКонтакте',
  OTHER: 'Другое',
}

export const PLACEMENT_FORMAT_LABELS: Record<PlacementFormat, string> = {
  POST: 'Пост',
  STORIES: 'Stories',
  REELS: 'Reels',
  SHORTS: 'Shorts',
  INTEGRATION: 'Интеграция',
  LIVE: 'Прямой эфир',
}

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  REMOTE: 'Удалённо',
  ON_SITE: 'На месте',
  HYBRID: 'Гибрид',
}

export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  FIXED: 'Фиксированная',
  RANGE: 'Диапазон',
  NEGOTIABLE: 'По договорённости',
  BARTER: 'Бартер',
}

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  PREPAY: 'Предоплата',
  POSTPAY: 'После публикации',
  '50_50': '50/50',
  SAFE_DEAL: 'Безопасная сделка',
}

export const getPlatformLabel = (platform: Platform): string =>
  PLATFORM_LABELS[platform] ?? platform

export const getPlacementFormatLabel = (format: PlacementFormat): string =>
  PLACEMENT_FORMAT_LABELS[format] ?? format

export const getWorkFormatLabel = (workFormat: WorkFormat): string =>
  WORK_FORMAT_LABELS[workFormat] ?? workFormat

export const getBudgetTypeLabel = (type: BudgetType): string =>
  BUDGET_TYPE_LABELS[type] ?? type

export const CONTENT_STYLE_LABELS: Record<ContentStyle, string> = {
  LIFESTYLE: 'Лайфстайл',
  REVIEW: 'Обзор',
  HUMOR: 'Юмор',
  EXPERT: 'Экспертный',
  UGC: 'UGC',
  UNBOXING: 'Распаковка',
  TUTORIAL: 'Обучение',
  VLOG: 'Влог',
  STORYTELLING: 'Сторителлинг',
  BEFORE_AFTER: 'До/после',
  CHALLENGE: 'Челлендж',
  BUYING: 'Покупки',
  SPORTS: 'Спорт',
  PODCAST: 'Подкаст',
  INTERVIEW: 'Интервью',
  ASMR: 'ASMR',
  EDUCATIONAL: 'Образовательный',
}

export const USAGE_RIGHTS_LABELS: Record<UsageRights, string> = {
  ORGANIC_ONLY: 'Только органика',
  PAID_ADS: 'Таргет / paid ads',
  FULL_LICENSE: 'Полная лицензия',
}

export const getContentStyleLabel = (style: ContentStyle): string =>
  CONTENT_STYLE_LABELS[style] ?? style

export const getUsageRightsLabel = (rights: UsageRights): string =>
  USAGE_RIGHTS_LABELS[rights] ?? rights

export const getPaymentTermsLabel = (terms: PaymentTerms): string =>
  PAYMENT_TERMS_LABELS[terms] ?? terms

/** HTML date input (YYYY-MM-DD) → ISO date-time for API */
export const formatPostDeadlineForApi = (date?: string): string | undefined => {
  if (!date?.trim()) return undefined

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T12:00:00.000Z`).toISOString()
  }

  return date
}

/** ISO date-time from API → YYYY-MM-DD for date input */
export const parsePostDeadlineForForm = (deadline?: string): string => {
  if (!deadline) return ''

  return deadline.slice(0, 10)
}

const formatAmount = (amount?: number, currency: PostBudget['currency'] = 'RUB') => {
  if (amount == null) return ''

  const symbol = currency === 'USD' ? '$' : '₽'

  return `${amount.toLocaleString('ru-RU')} ${symbol}`
}

export const formatPostBudget = (budget?: PostBudget): string => {
  if (!budget) return '—'

  switch (budget.type) {
    case 'FIXED':
      return budget.amount != null
        ? formatAmount(budget.amount, budget.currency)
        : '—'
    case 'RANGE':
      if (budget.minAmount != null && budget.maxAmount != null) {
        return `от ${formatAmount(budget.minAmount, budget.currency)} до ${formatAmount(budget.maxAmount, budget.currency)}`
      }

      if (budget.minAmount != null) {
        return `от ${formatAmount(budget.minAmount, budget.currency)}`
      }

      if (budget.maxAmount != null) {
        return `до ${formatAmount(budget.maxAmount, budget.currency)}`
      }

      return '—'
    case 'NEGOTIABLE':
      return 'По договорённости'
    case 'BARTER':
      return budget.barterDescription || '—'
    default:
      return '—'
  }
}

export const formatPlatforms = (platforms?: Platform[]): string => {
  if (!platforms?.length) return '—'

  return platforms.map(getPlatformLabel).join(', ')
}

export const formatPlacementFormats = (formats?: PlacementFormat[]): string => {
  if (!formats?.length) return '—'

  return formats.map(getPlacementFormatLabel).join(', ')
}

export const formatPostDeliverable = (item: PostDeliverable): string => {
  const platform = getPlatformLabel(item.platform)
  const format = getPlacementFormatLabel(item.format)
  const countLabel = item.count === 1 ? '1 шт.' : `${item.count} шт.`
  const duration =
    item.durationSec != null ? `, ${item.durationSec} сек.` : ''

  return `${platform} · ${format} · ${countLabel}${duration}`
}

export const formatPostDeliverables = (deliverables?: PostDeliverable[]): string => {
  if (!deliverables?.length) return '—'

  return deliverables.map(formatPostDeliverable).join('; ')
}

export const formatYesNo = (value?: boolean): string => {
  if (value === true) return 'Да'
  if (value === false) return 'Нет'

  return '—'
}

export const formatPostLocation = (
  location?: import('./types').PostLocation,
): string => {
  if (!location) return '—'

  const parts = [location.country, location.city, location.address].filter(
    Boolean,
  )

  if (!parts.length && !location.shootingRequired) return '—'

  const address = parts.join(', ') || '—'

  return location.shootingRequired
    ? `${address}${address !== '—' ? ' · ' : ''}Нужна съёмка на месте`
    : address
}

export const formatBloggerRequirements = (
  requirements?: import('./types').BloggerRequirements,
): string[] => {
  if (!requirements) return []

  const lines: string[] = []

  if (requirements.minFollowers != null || requirements.maxFollowers != null) {
    const min =
      requirements.minFollowers != null
        ? `от ${requirements.minFollowers.toLocaleString('ru-RU')}`
        : ''
    const max =
      requirements.maxFollowers != null
        ? `до ${requirements.maxFollowers.toLocaleString('ru-RU')}`
        : ''

    lines.push(`Подписчики: ${[min, max].filter(Boolean).join(' ')}`.trim())
  }

  if (requirements.minEngagementRate != null) {
    lines.push(`ER от ${requirements.minEngagementRate}%`)
  }

  if (requirements.verifiedAccount) {
    lines.push('Верифицированный аккаунт')
  }

  if (requirements.experienceWithAds) {
    lines.push('Опыт рекламы')
  }

  if (requirements.languages?.length) {
    lines.push(`Языки: ${requirements.languages.join(', ')}`)
  }

  return lines
}

export const formatCooperationDetails = (
  details?: import('./types').CooperationDetails,
): string[] => {
  if (!details) return []

  const lines: string[] = []

  if (details.exclusivity) {
    lines.push(
      details.exclusivityDays != null
        ? `Эксклюзив: ${details.exclusivityDays} дн.`
        : 'Эксклюзив',
    )
  }

  if (details.usageRights) {
    const duration =
      details.usageDurationDays != null
        ? `, ${details.usageDurationDays} дн.`
        : ''

    lines.push(`${getUsageRightsLabel(details.usageRights)}${duration}`)
  }

  if (details.requiresMarking) lines.push('Маркировка рекламы')
  if (details.requiresContract) lines.push('Договор')
  if (details.ndaRequired) lines.push('NDA')

  return lines
}

export const formatPostBrief = (
  brief?: import('./types').PostBrief,
): { label: string; value: string }[] => {
  if (!brief) return []

  const items: { label: string; value: string }[] = []

  if (brief.taskDescription?.trim()) {
    items.push({ label: 'Задача', value: brief.taskDescription.trim() })
  }

  if (brief.brandGuidelinesUrl?.trim()) {
    items.push({ label: 'Гайдлайны', value: brief.brandGuidelinesUrl.trim() })
  }

  if (brief.dosAndDonts?.trim()) {
    items.push({ label: 'Можно / нельзя', value: brief.dosAndDonts.trim() })
  }

  if (brief.references?.length) {
    items.push({ label: 'Референсы', value: brief.references.join(', ') })
  }

  if (brief.hashtags?.length) {
    items.push({ label: 'Хештеги', value: brief.hashtags.join(', ') })
  }

  if (brief.mentions?.length) {
    items.push({ label: 'Упоминания', value: brief.mentions.join(', ') })
  }

  return items
}

export const formatPostBudgetDetails = (
  budget?: PostBudget,
): { label: string; value: string }[] => {
  if (!budget) return []

  const items: { label: string; value: string }[] = [
    { label: 'Тип', value: getBudgetTypeLabel(budget.type) },
    { label: 'Сумма', value: formatPostBudget(budget) },
  ]

  if (budget.paymentTerms) {
    items.push({
      label: 'Оплата',
      value: getPaymentTermsLabel(budget.paymentTerms),
    })
  }

  return items
}

export const mapPostMediaToPhotos = (media: PostMedia[]): Photo[] =>
  media.map(item => ({
    id: item.id,
    url: item.url,
    key: item.key,
    mimeType: item.mimeType,
    size: item.size,
  }))

export const getApplicationsCountLabel = (applications: Application[]) => {
  if (applications.length === 0) return '0 откликов'
  if (applications.length === 1) return '1 отклик'
  if (applications.length > 1 && applications.length <= 4) {
    return `${applications.length} отклика`
  }

  return `${applications.length} откликов`
}
