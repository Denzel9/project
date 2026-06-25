import { MenuItem, Stack } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  ContentStyleEnum,
  UsageRightsEnum,
  getContentStyleLabel,
  getUsageRightsLabel,
} from '@/entities/post';
import { RHFInput, RHFSwitch } from '@/shared/ui/rhf';

import { FormSection } from './components/FormSection';
import { MultiSelectChips } from './components/MultiSelectChips';
import { TagsInput } from './components/TagsInput';

const CONTENT_STYLE_OPTIONS = Object.values(ContentStyleEnum).map(value => ({
  value,
  label: getContentStyleLabel(value),
}));

const USAGE_RIGHTS_OPTIONS = Object.values(UsageRightsEnum).map(value => ({
  value,
  label: getUsageRightsLabel(value),
}));

export const MetaSection = () => (
  <FormSection
    title="Категории и теги"
    description="Помогают блогерам находить объявление"
  >
    <Stack spacing={3}>
      <TagsInput
        name="categories"
        label="Категории"
        placeholder="Введите и нажмите Enter"
      />
      <TagsInput
        name="tags"
        label="Теги"
        placeholder="Введите и нажмите Enter"
      />
      <TagsInput
        name="keyWords"
        label="Ключевые слова"
        placeholder="Введите и нажмите Enter"
      />
      <TagsInput
        name="niche"
        label="Ниша"
        placeholder="beauty, food, tech..."
      />
    </Stack>
  </FormSection>
);

export const LocationSection = () => {
  const { control } = useFormContext();

  return (
    <FormSection title="Локация">
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <RHFInput
            name="locationCountry"
            control={control}
            props={{ fullWidth: true, label: 'Страна' }}
          />
          <RHFInput
            name="locationCity"
            control={control}
            props={{ fullWidth: true, label: 'Город' }}
          />
        </Stack>

        <RHFInput
          name="locationAddress"
          control={control}
          props={{ fullWidth: true, label: 'Адрес' }}
        />

        <RHFSwitch
          name="shootingRequired"
          control={control}
          label="Нужна съёмка на месте"
        />
      </Stack>
    </FormSection>
  );
};

export const BloggerRequirementsSection = () => {
  const { control } = useFormContext();

  return (
    <FormSection title="Требования к блогеру">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <RHFInput
            name="bloggerMinFollowers"
            control={control}
            props={{ fullWidth: true, label: 'Подписчики от' }}
          />
          <RHFInput
            name="bloggerMaxFollowers"
            control={control}
            props={{ fullWidth: true, label: 'Подписчики до' }}
          />
          <RHFInput
            name="bloggerMinEngagementRate"
            control={control}
            props={{ fullWidth: true, label: 'ER от, %' }}
          />
        </Stack>

        <MultiSelectChips
          name="bloggerContentStyle"
          label="Стили контента"
          options={CONTENT_STYLE_OPTIONS}
        />

        <TagsInput
          name="bloggerLanguages"
          label="Языки"
          placeholder="ru, en..."
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <RHFSwitch
            name="bloggerVerifiedAccount"
            control={control}
            label="Верифицированный аккаунт"
          />
          <RHFSwitch
            name="bloggerExperienceWithAds"
            control={control}
            label="Опыт рекламы"
          />
        </Stack>
      </Stack>
    </FormSection>
  );
};

export const CooperationSection = () => {
  const { control } = useFormContext();

  const { coopExclusivity } = useWatch({ control });

  return (
    <FormSection title="Условия сотрудничества">
      <Stack spacing={3}>
        <Stack
          direction="column"
          spacing={2}
        >
          <RHFSwitch
            name="coopExclusivity"
            control={control}
            label="Эксклюзив"
          />
          {coopExclusivity && (
            <RHFInput
              name="coopExclusivityDays"
              control={control}
              props={{ fullWidth: true, label: 'Срок эксклюзива, дней' }}
            />
          )}
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <RHFInput
            name="coopUsageRights"
            control={control}
            props={{
              select: true,
              fullWidth: true,
              label: 'Права на использование',
            }}
          >
            <MenuItem value="">Не указано</MenuItem>
            {USAGE_RIGHTS_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </RHFInput>

          <RHFInput
            name="coopUsageDurationDays"
            control={control}
            props={{ fullWidth: true, label: 'Срок использования, дней' }}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <RHFSwitch
            name="coopRequiresMarking"
            control={control}
            label="Маркировка рекламы"
          />
          <RHFSwitch
            name="coopRequiresContract"
            control={control}
            label="Договор"
          />
          <RHFSwitch
            name="coopNdaRequired"
            control={control}
            label="NDA"
          />
        </Stack>
      </Stack>
    </FormSection>
  );
};

export const BriefSection = () => {
  const { control } = useFormContext();

  return (
    <FormSection title="Бриф">
      <Stack spacing={3}>
        <RHFInput
          name="briefTaskDescription"
          control={control}
          props={{
            fullWidth: true,
            multiline: true,
            rows: 4,
            label: 'Описание задачи',
          }}
        />

        <RHFInput
          name="briefBrandGuidelinesUrl"
          control={control}
          props={{ fullWidth: true, label: 'Ссылка на гайдлайны' }}
        />

        <RHFInput
          name="briefCta"
          control={control}
          props={{ fullWidth: true, label: 'Call to action' }}
        />

        <RHFInput
          name="briefDosAndDonts"
          control={control}
          props={{
            fullWidth: true,
            multiline: true,
            rows: 3,
            label: 'Можно / нельзя',
          }}
        />

        <TagsInput
          name="briefReferences"
          label="Референсы (ссылки)"
          placeholder="https://..."
        />
        <TagsInput
          name="briefHashtags"
          label="Хештеги"
          placeholder="#реклама"
        />
        <TagsInput
          name="briefMentions"
          label="Упоминания"
          placeholder="@brand"
        />
      </Stack>
    </FormSection>
  );
};
