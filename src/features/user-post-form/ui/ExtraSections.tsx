import { MenuItem, Stack } from '@mui/material'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  BudgetTypeEnum,
  PaymentTermsEnum,
  PlatformEnum,
  getBudgetTypeLabel,
  getPaymentTermsLabel,
  getPlatformLabel,
} from '@/entities/post'
import { FormSection } from '@/features/application-form/ui/components/FormSection'
import { MultiSelectChips } from '@/features/application-form/ui/components/MultiSelectChips'
import { TagsInput } from '@/features/application-form/ui/components/TagsInput'
import { LocationAutocomplete } from '@/shared'
import { RHFInput } from '@/shared/ui/rhf'

const PLATFORM_OPTIONS = Object.values(PlatformEnum).map(value => ({
  value,
  label: getPlatformLabel(value),
}))

const BUDGET_TYPE_OPTIONS = Object.values(BudgetTypeEnum).map(value => ({
  value,
  label: getBudgetTypeLabel(value),
}))

const PAYMENT_TERMS_OPTIONS = Object.values(PaymentTermsEnum).map(value => ({
  value,
  label: getPaymentTermsLabel(value),
}))

export const MetaSection = () => (
  <FormSection
    title="Категории и теги"
    description="Помогают компаниям находить ваш пост"
  >
    <Stack
      spacing={3}
      sx={{ width: { xs: '100%', md: '50%' } }}
    >
      <TagsInput
        name="categories"
        label="Категории"
        placeholder="Введите и нажмите Enter"
      />
      <TagsInput
        name="keyWords"
        label="Ключевые слова / навыки"
        placeholder="UGC, монтаж, съёмка…"
      />
      <TagsInput
        name="niche"
        label="Ниша"
        placeholder="beauty, food, tech…"
      />
      <TagsInput
        name="tags"
        label="Теги"
        placeholder="Введите и нажмите Enter"
      />
    </Stack>
  </FormSection>
)

export const PlatformsSection = () => (
  <FormSection
    title="Площадки"
    description="Где вы ведёте контент или готовы работать"
  >
    <MultiSelectChips
      name="platforms"
      label="Платформы"
      options={PLATFORM_OPTIONS}
    />
  </FormSection>
)

export const LocationSection = () => {
  const { control, setValue } = useFormContext()

  return (
    <FormSection title="Локация">
      <Stack
        spacing={2}
        sx={{ width: { xs: '100%', md: '50%' } }}
      >
        <LocationAutocomplete
          name="locationAddress"
          control={control}
          label="Город / адрес"
          onPlaceSelect={place => {
            const address = place?.address
            setValue(
              'locationCity',
              address?.city ||
                address?.town ||
                address?.village ||
                address?.municipality ||
                '',
            )
            setValue('locationCountry', address?.country || '')
          }}
        />
      </Stack>
    </FormSection>
  )
}

export const BudgetSection = () => {
  const { control } = useFormContext()
  const budgetType = useWatch({ control, name: 'budgetType' })

  return (
    <FormSection
      title="Ставка"
      description="Ориентир по стоимости вашей работы"
    >
      <Stack
        spacing={3}
        sx={{ width: { xs: '100%', md: '50%' } }}
      >
        <RHFInput
          name="budgetType"
          control={control}
          props={{
            select: true,
            fullWidth: true,
            label: 'Тип ставки',
            sx: { maxWidth: 320 },
          }}
        >
          {BUDGET_TYPE_OPTIONS.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </RHFInput>

        {budgetType !== BudgetTypeEnum.BARTER &&
          budgetType !== BudgetTypeEnum.NEGOTIABLE && (
            <RHFInput
              name="paymentTerms"
              control={control}
              props={{
                select: true,
                fullWidth: true,
                label: 'Условия оплаты',
                sx: { maxWidth: 320 },
              }}
            >
              <MenuItem value="">Не указано</MenuItem>
              {PAYMENT_TERMS_OPTIONS.map(option => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </RHFInput>
          )}

        {budgetType === BudgetTypeEnum.FIXED && (
          <RHFInput
            name="budgetAmount"
            control={control}
            endAdornment="₽"
            props={{
              fullWidth: true,
              label: 'Сумма',
              sx: { maxWidth: 320 },
            }}
          />
        )}

        {budgetType === BudgetTypeEnum.RANGE && (
          <Stack
            spacing={2}
            direction={{ xs: 'column', sm: 'row' }}
          >
            <RHFInput
              name="budgetMinAmount"
              control={control}
              endAdornment="₽"
              props={{ fullWidth: true, label: 'От' }}
            />
            <RHFInput
              name="budgetMaxAmount"
              control={control}
              endAdornment="₽"
              props={{ fullWidth: true, label: 'До' }}
            />
          </Stack>
        )}

        {budgetType === BudgetTypeEnum.BARTER && (
          <RHFInput
            name="barterDescription"
            control={control}
            props={{
              fullWidth: true,
              multiline: true,
              rows: 3,
              label: 'Описание бартера',
            }}
          />
        )}
      </Stack>
    </FormSection>
  )
}

export const PortfolioLinksSection = () => (
  <FormSection
    title="Ссылки"
    description="Портфолио, соцсети или сайт"
  >
    <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
      <TagsInput
        name="portfolioLinks"
        label="Ссылки"
        placeholder="https://…"
      />
    </Stack>
  </FormSection>
)
