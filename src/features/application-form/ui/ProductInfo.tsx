import { MenuItem, Stack, useMediaQuery } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  BudgetTypeEnum,
  PaymentTermsEnum,
  getBudgetTypeLabel,
  getPaymentTermsLabel,
} from '@/entities/post';
import { RHFDatePicker, RHFInput } from '@/shared/ui/rhf';

import { DeliverablesField } from './components/DeliverablesField';
import { FormSection } from './components/FormSection';

const BUDGET_TYPE_OPTIONS = Object.values(BudgetTypeEnum).map(value => ({
  value,
  label: getBudgetTypeLabel(value),
}));

const PAYMENT_TERMS_OPTIONS = Object.values(PaymentTermsEnum).map(value => ({
  value,
  label: getPaymentTermsLabel(value),
}));

export const ProductInfo = () => {
  const { control } = useFormContext();
  const budgetType = useWatch({ control, name: 'budgetType' });

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  return (
    <Stack>
      <FormSection
        title="Описание и сроки"
        description="Основная информация для карточки объявления"
      >
        <Stack spacing={3}>
          <RHFInput
            name="description"
            control={control}
            maxLength={400}
            props={{
              rows: 5,
              fullWidth: true,
              multiline: true,
              label: 'Описание',
            }}
          />

          <RHFDatePicker
            name="deadline"
            control={control}
            label="Дедлайн"
            width={isMobile ? '100%' : 300}
          />
        </Stack>
      </FormSection>

      <FormSection
        title="Площадки и форматы"
        description="Выберите площадку и формат — позиция добавится автоматически"
      >
        <DeliverablesField />
      </FormSection>

      <FormSection title="Бюджет">
        <Stack spacing={3}>
          <RHFInput
            name="budgetType"
            control={control}
            props={{
              select: true,
              fullWidth: true,
              label: 'Тип бюджета',
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
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
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
        </Stack>
      </FormSection>
    </Stack>
  );
};
