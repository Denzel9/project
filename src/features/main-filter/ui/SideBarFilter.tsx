import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  BudgetTypeEnum,
  ContentStyleEnum,
  PaymentTermsEnum,
  PlacementFormatEnum,
  PlatformEnum,
  UsageRightsEnum,
  WorkFormatEnum,
  getBudgetTypeLabel,
  getContentStyleLabel,
  getPaymentTermsLabel,
  getPlacementFormatLabel,
  getPlatformLabel,
  getUsageRightsLabel,
  getWorkFormatLabel,
} from '@/entities';

import { useMainFilterStore } from '../model/store';
import {
  defaultPostFilterDraft,
  type PostFilterBloggerRequirements,
  type PostFilterBrief,
  type PostFilterBudget,
  type PostFilterCooperationDetails,
  type PostFilterDeliverable,
  type PostFilterDraft,
  type PostFilterLocation,
  type TriStateFilter,
} from '../model/types';

import { FilterChipGroup } from './components/FilterChipGroup';
import { FilterSection } from './components/FilterSection';
import { FilterTagsInput } from './components/FilterTagsInput';

const CHIP_OPTIONS = [
  'Удаленно',
  'На месте работадатель',
  'По договору',
  'Подтвержденный аккаунт',
].map(value => ({ value, label: value }));

const PLATFORM_OPTIONS = Object.values(PlatformEnum).map(value => ({
  value,
  label: getPlatformLabel(value),
}));

const PLACEMENT_FORMAT_OPTIONS = Object.values(PlacementFormatEnum).map(
  value => ({
    value,
    label: getPlacementFormatLabel(value),
  }),
);

const CONTENT_STYLE_OPTIONS = Object.values(ContentStyleEnum).map(value => ({
  value,
  label: getContentStyleLabel(value),
}));

const TRI_STATE_OPTIONS: { value: TriStateFilter; label: string }[] = [
  { value: '', label: 'Любой' },
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
];

export const SideBarFilter = () => {
  const {
    isOpenMainFilter,
    setIsOpenMainFilter,
    postFilters,
    setPostFilters,
    resetPostFilters,
  } = useMainFilterStore();
  const [draft, setDraft] = useState<PostFilterDraft>(defaultPostFilterDraft);

  useEffect(() => {
    if (!isOpenMainFilter) return;

    setTimeout(() => {
      setDraft(postFilters);
    }, 0);
  }, [isOpenMainFilter, postFilters]);

  const setField = <K extends keyof PostFilterDraft>(
    key: K,
    value: PostFilterDraft[K],
  ) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const setBudget = (patch: Partial<PostFilterBudget>) => {
    setDraft(prev => ({
      ...prev,
      budget: { ...prev.budget, ...patch },
    }));
  };

  const setLocation = (patch: Partial<PostFilterLocation>) => {
    setDraft(prev => ({
      ...prev,
      location: { ...prev.location, ...patch },
    }));
  };

  const setBloggerRequirements = (
    patch: Partial<PostFilterBloggerRequirements>,
  ) => {
    setDraft(prev => ({
      ...prev,
      bloggerRequirements: { ...prev.bloggerRequirements, ...patch },
    }));
  };

  const setCooperationDetails = (
    patch: Partial<PostFilterCooperationDetails>,
  ) => {
    setDraft(prev => ({
      ...prev,
      cooperationDetails: { ...prev.cooperationDetails, ...patch },
    }));
  };

  const setBrief = (patch: Partial<PostFilterBrief>) => {
    setDraft(prev => ({
      ...prev,
      brief: { ...prev.brief, ...patch },
    }));
  };

  const setDeliverables = (patch: Partial<PostFilterDeliverable>) => {
    setDraft(prev => ({
      ...prev,
      deliverables: { ...prev.deliverables, ...patch },
    }));
  };

  const handleApply = () => {
    setPostFilters(draft);
    setIsOpenMainFilter(false);
  };

  const handleReset = () => {
    resetPostFilters();
    setDraft(defaultPostFilterDraft);
    setIsOpenMainFilter(false);
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: '100%',
        minHeight: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">Фильтры</Typography>
        <IconButton onClick={() => setIsOpenMainFilter(false)}>
          <Close />
        </IconButton>
      </Stack>

      <Box
        sx={{
          flex: 1,
          pr: 0.5,
          mr: -0.5,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Stack spacing={2}>
          <FilterSection title="Основное">
            <Stack spacing={2}>
              <TextField
                size="small"
                fullWidth
                label="Название"
                value={draft.title}
                onChange={event => setField('title', event.target.value)}
              />

              <FilterChipGroup
                label="Chips"
                value={draft.chips}
                options={CHIP_OPTIONS}
                onChange={value => setField('chips', value)}
              />

              <TextField
                size="small"
                fullWidth
                select
                label="Срочность"
                value={draft.urgent}
                onChange={event =>
                  setField('urgent', event.target.value as TriStateFilter)
                }
              >
                {TRI_STATE_OPTIONS.map(option => (
                  <MenuItem
                    key={option.value || 'any'}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                fullWidth
                type="date"
                label="Дата создания"
                value={draft.createdAt}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={event => setField('createdAt', event.target.value)}
              />
            </Stack>
          </FilterSection>

          <FilterSection title="Категории и теги">
            <Stack spacing={2}>
              <FilterTagsInput
                label="Категории"
                placeholder="Введите и нажмите Enter"
                value={draft.categories}
                onChange={value => setField('categories', value)}
              />
              <FilterTagsInput
                label="Теги"
                placeholder="Введите и нажмите Enter"
                value={draft.tags}
                onChange={value => setField('tags', value)}
              />
              <FilterTagsInput
                label="Ниша"
                placeholder="beauty, food, tech..."
                value={draft.niche}
                onChange={value => setField('niche', value)}
              />
            </Stack>
          </FilterSection>

          <FilterSection title="Площадки и формат">
            <Stack spacing={2}>
              <FilterChipGroup
                label="Площадки"
                value={draft.platforms}
                options={PLATFORM_OPTIONS}
                onChange={value => setField('platforms', value)}
              />

              <FilterChipGroup
                label="Формат размещения"
                value={draft.placementFormats}
                options={PLACEMENT_FORMAT_OPTIONS}
                onChange={value => setField('placementFormats', value)}
              />

              <TextField
                size="small"
                fullWidth
                select
                label="Формат работы"
                value={draft.workFormat}
                onChange={event =>
                  setField(
                    'workFormat',
                    event.target.value as PostFilterDraft['workFormat'],
                  )
                }
              >
                <MenuItem value="">Любой</MenuItem>
                {Object.values(WorkFormatEnum).map(option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {getWorkFormatLabel(option)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </FilterSection>

          <FilterSection title="Бюджет">
            <Stack spacing={2}>
              <TextField
                size="small"
                fullWidth
                select
                label="Тип бюджета"
                value={draft.budget.type}
                onChange={event =>
                  setBudget({
                    type: event.target.value as PostFilterBudget['type'],
                  })
                }
              >
                <MenuItem value="">Любой</MenuItem>
                {Object.values(BudgetTypeEnum).map(option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {getBudgetTypeLabel(option)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                fullWidth
                select
                label="Валюта"
                value={draft.budget.currency}
                onChange={event =>
                  setBudget({
                    currency: event.target.value as PostFilterBudget['currency'],
                  })
                }
              >
                <MenuItem value="">Любая</MenuItem>
                <MenuItem value="RUB">₽ RUB</MenuItem>
                <MenuItem value="USD">$ USD</MenuItem>
              </TextField>

              <TextField
                size="small"
                fullWidth
                select
                label="Условия оплаты"
                value={draft.budget.paymentTerms}
                onChange={event =>
                  setBudget({
                    paymentTerms: event.target
                      .value as PostFilterBudget['paymentTerms'],
                  })
                }
              >
                <MenuItem value="">Любые</MenuItem>
                {Object.values(PaymentTermsEnum).map(option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {getPaymentTermsLabel(option)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </FilterSection>

          <FilterSection title="Сроки">
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Дедлайн"
              value={draft.deadline}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={event => setField('deadline', event.target.value)}
            />
          </FilterSection>

          <FilterSection title="Локация">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Страна"
                  value={draft.location.country}
                  onChange={event =>
                    setLocation({ country: event.target.value })
                  }
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Город"
                  value={draft.location.city}
                  onChange={event => setLocation({ city: event.target.value })}
                />
              </Stack>

              <TextField
                size="small"
                fullWidth
                label="Адрес"
                value={draft.location.address}
                onChange={event =>
                  setLocation({ address: event.target.value })
                }
              />

              <TextField
                size="small"
                fullWidth
                select
                label="Съёмка на месте"
                value={draft.location.shootingRequired}
                onChange={event =>
                  setLocation({
                    shootingRequired: event.target.value as TriStateFilter,
                  })
                }
              >
                {TRI_STATE_OPTIONS.map(option => (
                  <MenuItem
                    key={`shooting-${option.value || 'any'}`}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </FilterSection>

          <FilterSection title="Требования к блогеру">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Подписчики от"
                  value={draft.bloggerRequirements.minFollowers}
                  onChange={event =>
                    setBloggerRequirements({ minFollowers: event.target.value })
                  }
                />
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Подписчики до"
                  value={draft.bloggerRequirements.maxFollowers}
                  onChange={event =>
                    setBloggerRequirements({ maxFollowers: event.target.value })
                  }
                />
              </Stack>

              <TextField
                size="small"
                fullWidth
                type="number"
                label="ER от, %"
                value={draft.bloggerRequirements.minEngagementRate}
                onChange={event =>
                  setBloggerRequirements({
                    minEngagementRate: event.target.value,
                  })
                }
              />

              <FilterChipGroup
                label="Стили контента"
                value={draft.bloggerRequirements.contentStyle}
                options={CONTENT_STYLE_OPTIONS}
                onChange={value =>
                  setBloggerRequirements({ contentStyle: value })
                }
              />

              <FilterTagsInput
                label="Языки"
                placeholder="ru, en..."
                value={draft.bloggerRequirements.languages}
                onChange={value => setBloggerRequirements({ languages: value })}
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Верификация"
                  value={draft.bloggerRequirements.verifiedAccount}
                  onChange={event =>
                    setBloggerRequirements({
                      verifiedAccount: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`verified-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Опыт рекламы"
                  value={draft.bloggerRequirements.experienceWithAds}
                  onChange={event =>
                    setBloggerRequirements({
                      experienceWithAds: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`experience-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </FilterSection>

          <FilterSection title="Условия сотрудничества">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Эксклюзив"
                  value={draft.cooperationDetails.exclusivity}
                  onChange={event =>
                    setCooperationDetails({
                      exclusivity: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`exclusivity-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Срок эксклюзива, дней"
                  value={draft.cooperationDetails.exclusivityDays}
                  onChange={event =>
                    setCooperationDetails({
                      exclusivityDays: event.target.value,
                    })
                  }
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Права на использование"
                  value={draft.cooperationDetails.usageRights}
                  onChange={event =>
                    setCooperationDetails({
                      usageRights: event.target
                        .value as PostFilterCooperationDetails['usageRights'],
                    })
                  }
                >
                  <MenuItem value="">Любые</MenuItem>
                  {Object.values(UsageRightsEnum).map(option => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {getUsageRightsLabel(option)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Срок использования, дней"
                  value={draft.cooperationDetails.usageDurationDays}
                  onChange={event =>
                    setCooperationDetails({
                      usageDurationDays: event.target.value,
                    })
                  }
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Маркировка рекламы"
                  value={draft.cooperationDetails.requiresMarking}
                  onChange={event =>
                    setCooperationDetails({
                      requiresMarking: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`marking-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  select
                  label="Договор"
                  value={draft.cooperationDetails.requiresContract}
                  onChange={event =>
                    setCooperationDetails({
                      requiresContract: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`contract-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  select
                  label="NDA"
                  value={draft.cooperationDetails.ndaRequired}
                  onChange={event =>
                    setCooperationDetails({
                      ndaRequired: event.target.value as TriStateFilter,
                    })
                  }
                >
                  {TRI_STATE_OPTIONS.map(option => (
                    <MenuItem
                      key={`nda-${option.value || 'any'}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </FilterSection>

          <FilterSection title="Бриф">
            <Stack spacing={2}>
              <FilterTagsInput
                label="Хештеги"
                placeholder="#реклама"
                value={draft.brief.hashtags}
                onChange={value => setBrief({ hashtags: value })}
              />
              <FilterTagsInput
                label="Упоминания"
                placeholder="@brand"
                value={draft.brief.mentions}
                onChange={value => setBrief({ mentions: value })}
              />
            </Stack>
          </FilterSection>

          <FilterSection title="Deliverables">
            <Stack spacing={2}>
              <TextField
                size="small"
                fullWidth
                select
                label="Площадка"
                value={draft.deliverables.platform}
                onChange={event =>
                  setDeliverables({
                    platform: event.target
                      .value as PostFilterDeliverable['platform'],
                  })
                }
              >
                <MenuItem value="">Любая</MenuItem>
                {Object.values(PlatformEnum).map(option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {getPlatformLabel(option)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                fullWidth
                select
                label="Формат"
                value={draft.deliverables.format}
                onChange={event =>
                  setDeliverables({
                    format: event.target
                      .value as PostFilterDeliverable['format'],
                  })
                }
              >
                <MenuItem value="">Любой</MenuItem>
                {Object.values(PlacementFormatEnum).map(option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {getPlacementFormatLabel(option)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </FilterSection>
        </Stack>
      </Box>

      <Stack
        spacing={1}
        sx={{
          pt: 2,
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleApply}
        >
          Применить
        </Button>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={handleReset}
        >
          Сбросить
        </Button>
      </Stack>
    </Stack>
  );
};
