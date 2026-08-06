import {
  BudgetTypeEnum,
  type BudgetType,
  type CreatePostDto,
  type PaymentTerms,
  type Platform,
  type Post,
  type PostBrief,
  type PostBudget,
  type PostLocation,
  type UpdatePostDto,
  type WorkFormat,
} from '@/entities/post'

import type { FormProductType } from './schema/schema'

const parseNumber = (value?: string) => {
  if (!value?.trim()) return undefined

  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))

  return Number.isNaN(parsed) ? undefined : parsed
}

const parseStringArray = (values?: (string | undefined)[]) =>
  values
    ?.map(item => item?.trim())
    .filter((item): item is string => Boolean(item)) ?? []

const mapBudgetFromForm = (form: FormProductType): PostBudget | undefined => {
  const type = form.budgetType as BudgetType

  const base = {
    type,
    ...(form.budgetCurrency && {
      currency: form.budgetCurrency as PostBudget['currency'],
    }),
    ...(form.paymentTerms && {
      paymentTerms: form.paymentTerms as PaymentTerms,
    }),
  }

  switch (type) {
    case BudgetTypeEnum.FIXED: {
      const amount = parseNumber(form.budgetAmount)

      if (amount == null && !form.paymentTerms) return undefined

      return amount != null ? { ...base, amount } : base
    }
    case BudgetTypeEnum.RANGE: {
      const minAmount = parseNumber(form.budgetMinAmount)
      const maxAmount = parseNumber(form.budgetMaxAmount)

      if (minAmount == null && maxAmount == null && !form.paymentTerms) {
        return undefined
      }

      return {
        ...base,
        ...(minAmount != null && { minAmount }),
        ...(maxAmount != null && { maxAmount }),
      }
    }
    case BudgetTypeEnum.BARTER: {
      if (!form.barterDescription?.trim()) return undefined

      return {
        ...base,
        barterDescription: form.barterDescription.trim(),
      }
    }
    case BudgetTypeEnum.NEGOTIABLE:
      return { type }
    default:
      return undefined
  }
}

const mapBudgetToForm = (budget?: PostBudget) => ({
  budgetType: budget?.type ?? BudgetTypeEnum.NEGOTIABLE,
  budgetAmount: budget?.amount != null ? String(budget.amount) : '',
  budgetMinAmount: budget?.minAmount != null ? String(budget.minAmount) : '',
  budgetMaxAmount: budget?.maxAmount != null ? String(budget.maxAmount) : '',
  barterDescription: budget?.barterDescription ?? '',
  budgetCurrency: budget?.currency ?? 'RUB',
  paymentTerms: budget?.paymentTerms ?? '',
})

const mapLocationFromForm = (
  form: FormProductType,
): PostLocation | undefined => {
  const city = form.locationCity?.trim()
  const country = form.locationCountry?.trim()
  const address = form.locationAddress?.trim()

  const location: PostLocation = {
    ...(city && { city }),
    ...(country && { country }),
    ...(address && { address }),
  }

  return Object.keys(location).length ? location : undefined
}

const mapLocationToForm = (location?: PostLocation) => ({
  locationCity: location?.city ?? '',
  locationCountry: location?.country ?? '',
  locationAddress: location?.address ?? '',
})

const mapBriefFromForm = (form: FormProductType): PostBrief | undefined => {
  const references = parseStringArray(form.portfolioLinks)

  if (!references.length) return undefined

  return { references }
}

const mapBriefToForm = (brief?: PostBrief) => ({
  portfolioLinks: brief?.references ?? [],
})

export const mapFormToCreatePost = (form: FormProductType): CreatePostDto => {
  const chips = parseStringArray(form.chips)
  const keyWords = parseStringArray(form.keyWords)
  const categories = parseStringArray(form.categories)
  const tags = parseStringArray(form.tags)
  const niche = parseStringArray(form.niche)
  const platforms = parseStringArray(form.platforms) as Platform[]
  const budget = mapBudgetFromForm(form)
  const brief = mapBriefFromForm(form)

  return {
    title: form.title,
    urgent: false,
    isPrivate: form.isPrivate,
    workFormat: form.workFormat as WorkFormat,
    ...(form.description?.trim() && { description: form.description.trim() }),
    ...(chips.length > 0 && { chips }),
    ...(keyWords.length > 0 && { keyWords }),
    ...(categories.length > 0 && { categories }),
    ...(tags.length > 0 && { tags }),
    ...(niche.length > 0 && { niche }),
    ...(platforms.length > 0 && { platforms }),
    ...(budget && { budget }),
    location: mapLocationFromForm(form),
    ...(brief && { brief }),
  }
}

export const mapFormToUpdatePost = (form: FormProductType): UpdatePostDto => ({
  ...mapFormToCreatePost(form),
})

export const mapPostToForm = (post: Post): Partial<FormProductType> => ({
  title: post.title,
  chips: (post.chips ?? []).map(chip =>
    chip === 'На месте работадатель' ? 'На месте работодателя' : chip,
  ).filter(chip => chip !== 'Подтвержденный аккаунт'),
  description: post.description,
  isPrivate: post.isPrivate ?? false,
  workFormat: post.workFormat ?? 'REMOTE',
  keyWords: post.keyWords ?? [],
  categories: post.categories ?? [],
  tags: post.tags ?? [],
  niche: post.niche ?? [],
  platforms: post.platforms ?? [],
  ...mapBudgetToForm(post.budget),
  ...mapLocationToForm(post.location),
  ...mapBriefToForm(post.brief),
})
