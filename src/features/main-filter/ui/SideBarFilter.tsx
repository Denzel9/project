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
  USER_ROLE,
  WorkFormatEnum,
  EmploymentTypeEnum,
  getBudgetTypeLabel,
  getContentStyleLabel,
  getPaymentTermsLabel,
  getPlacementFormatLabel,
  getPlatformLabel,
  getUsageRightsLabel,
  getWorkFormatLabel,
  getEmploymentTypeLabel,
} from '@/entities';
import { useAuthStore } from '@/features/auth';

import { useMainFilterStore } from '../model/store';
import {
  defaultPostFilterDraft,
  type PostFilterBloggerRequirements,
  type PostFilterBudget,
  type PostFilterCooperationDetails,
  type PostFilterDraft,
  type PostFilterLocation,
  type TriStateFilter,
} from '../model/types';
import {
  sanitizePostFilterDraftForRole,
} from '../model/utils';

import { FilterChipGroup } from './components/FilterChipGroup';
import { FilterDateField } from './components/FilterDateField';
import { FilterSection } from './components/FilterSection';
import { FilterTagsInput } from './components/FilterTagsInput';

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

const ADVANTAGE_CHIP_OPTIONS = [
  'Удаленно',
  'На месте работодателя',
  'По договору',
].map(value => ({ value, label: value }));

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
  const role = useAuthStore(state => state.role);
  const isCompanyViewer = role === USER_ROLE.COMPANY;
  const isCreatorViewer = role === USER_ROLE.CREATOR;
  const showCompanyAdFilters = isCreatorViewer || role === USER_ROLE.MANAGER;
  const showCreatorPostFilters = isCompanyViewer || role === USER_ROLE.MANAGER;

  const [draft, setDraft] = useState<PostFilterDraft>(defaultPostFilterDraft);

  useEffect(() => {
    if (!isOpenMainFilter) return;

    setTimeout(() => {
      setDraft(sanitizePostFilterDraftForRole(postFilters, role));
    }, 0);
  }, [isOpenMainFilter, postFilters, role]);

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

  const handleApply = () => {
    setPostFilters(sanitizePostFilterDraftForRole(draft, role));
    setIsOpenMainFilter(false);
  };

  const handleReset = () => {
    resetPostFilters();
    setDraft(defaultPostFilterDraft);
    setIsOpenMainFilter(false);
  };

  const budgetSectionTitle = isCompanyViewer ? 'Ставка' : 'Бюджет';
  const budgetTypeLabel = isCompanyViewer ? 'Тип ставки' : 'Тип бюджета';

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
        <Stack spacing={4}>
          <FilterSection>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Поиск"
                placeholder="Название, компания или имя"
                value={draft.title}
                onChange={event => setField('title', event.target.value)}
              />

              {showCompanyAdFilters && (
                <TextField
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
              )}

              <FilterDateField
                label="Дата создания"
                value={draft.createdAt}
                onChange={value => setField('createdAt', value)}
              />
            </Stack>
          </FilterSection>

          <FilterSection title="Категории и теги">
            <Stack spacing={2}>
              <FilterTagsInput
                size="medium"
                label="Категории"
                value={draft.categories}
                placeholder="Введите и нажмите Enter"
                onChange={value => setField('categories', value)}
              />
              <FilterTagsInput
                size="medium"
                label="Теги"
                value={draft.tags}
                placeholder="Введите и нажмите Enter"
                onChange={value => setField('tags', value)}
              />
              <FilterTagsInput
                size="medium"
                label="Ниша"
                value={draft.niche}
                placeholder="beauty, food, tech..."
                onChange={value => setField('niche', value)}
              />
              {showCreatorPostFilters && (
                <FilterChipGroup
                  label="Преимущества"
                  value={draft.chips}
                  options={ADVANTAGE_CHIP_OPTIONS}
                  onChange={value => setField('chips', value)}
                />
              )}
            </Stack>
          </FilterSection>

          <FilterSection
            title={
              showCompanyAdFilters && !isCompanyViewer
                ? 'Площадки и формат'
                : 'Площадки'
            }
          >
            <Stack spacing={4}>
              <FilterChipGroup
                value={draft.platforms}
                options={PLATFORM_OPTIONS}
                onChange={value => setField('platforms', value)}
              />

              {showCompanyAdFilters && (
                <FilterChipGroup
                  label="Форматы размещения"
                  value={draft.placementFormats}
                  options={PLACEMENT_FORMAT_OPTIONS}
                  onChange={value => setField('placementFormats', value)}
                />
              )}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
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

                <TextField
                  fullWidth
                  select
                  label="Тип занятости"
                  value={draft.employmentType}
                  onChange={event =>
                    setField(
                      'employmentType',
                      event.target.value as PostFilterDraft['employmentType'],
                    )
                  }
                >
                  <MenuItem value="">Любой</MenuItem>
                  {Object.values(EmploymentTypeEnum).map(option => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {getEmploymentTypeLabel(option)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </FilterSection>

          <FilterSection title={budgetSectionTitle}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                select
                label={budgetTypeLabel}
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
                fullWidth
                select
                label="Валюта"
                value={draft.budget.currency}
                onChange={event =>
                  setBudget({
                    currency: event.target
                      .value as PostFilterBudget['currency'],
                  })
                }
              >
                <MenuItem value="">Любая</MenuItem>
                <MenuItem value="RUB">₽ RUB</MenuItem>
                <MenuItem value="USD">$ USD</MenuItem>
              </TextField>

              <TextField
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

          {showCompanyAdFilters && (
            <FilterSection title="Сроки">
              <FilterDateField
                label="Дедлайн"
                value={draft.deadline}
                onChange={value => setField('deadline', value)}
              />
            </FilterSection>
          )}

          <FilterSection title="Локация">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <TextField
                  fullWidth
                  label="Страна"
                  value={draft.location.country}
                  onChange={event =>
                    setLocation({ country: event.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Город"
                  value={draft.location.city}
                  onChange={event => setLocation({ city: event.target.value })}
                />
              </Stack>

              {showCompanyAdFilters && (
                <TextField
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
              )}
            </Stack>
          </FilterSection>

          {showCompanyAdFilters && (
            <FilterSection title="Требования к блогеру">
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'row', sm: 'row' }}
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Подписчики от"
                    value={draft.bloggerRequirements.minFollowers}
                    onChange={event =>
                      setBloggerRequirements({
                        minFollowers: event.target.value,
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Подписчики до"
                    value={draft.bloggerRequirements.maxFollowers}
                    onChange={event =>
                      setBloggerRequirements({
                        maxFollowers: event.target.value,
                      })
                    }
                  />
                </Stack>

                <TextField
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

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    select
                    label="Верификация"
                    value={draft.bloggerRequirements.verifiedAccount}
                    onChange={event =>
                      setBloggerRequirements({
                        verifiedAccount: event.target
                          .value as TriStateFilter,
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
                    fullWidth
                    select
                    label="Опыт рекламы"
                    value={draft.bloggerRequirements.experienceWithAds}
                    onChange={event =>
                      setBloggerRequirements({
                        experienceWithAds: event.target
                          .value as TriStateFilter,
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
          )}

          {showCompanyAdFilters && (
            <FilterSection title="Условия сотрудничества">
              <Stack spacing={2}>
                <Stack
                  direction='column'
                  spacing={2}
                >
                  <TextField
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
                  direction='column'
                  spacing={2}
                >
                  <TextField
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
                  direction='column'
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    select
                    label="Маркировка рекламы"
                    value={draft.cooperationDetails.requiresMarking}
                    onChange={event =>
                      setCooperationDetails({
                        requiresMarking: event.target
                          .value as TriStateFilter,
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
                    fullWidth
                    select
                    label="Договор"
                    value={draft.cooperationDetails.requiresContract}
                    onChange={event =>
                      setCooperationDetails({
                        requiresContract: event.target
                          .value as TriStateFilter,
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
          )}
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          pt: 2,
          mt: 2,
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
        >
          Сбросить
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
        >
          Применить
        </Button>
      </Stack>
    </Stack>
  );
};
