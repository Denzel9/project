import { Close } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { FilterDateField } from '@/features/main-filter';
import {
  FilterAutocomplete,
  FilterStatusSelect,
  MobileFilterOpenButton,
  mobileFilterActionsSx,
} from '@/shared';

import {
  POST_APPLICATION_STATUS_FILTER_LABELS,
  type PostApplicationApplicantFilter,
  type PostApplicationStatusFilter,
} from '../model/utils';

type ApplicantOption = {
  id: string;
  label: string;
};

type PostApplicationsFilterProps = {
  createdDate: string | null;
  status: PostApplicationStatusFilter;
  applicantOptions: ApplicantOption[];
  applicantId: PostApplicationApplicantFilter;
  onCreatedDateChange: (value: string | null) => void;
  onStatusChange: (value: PostApplicationStatusFilter) => void;
  onApplicantChange: (value: PostApplicationApplicantFilter) => void;
};

type Draft = {
  status: PostApplicationStatusFilter;
  applicantId: PostApplicationApplicantFilter;
  createdDate: string | null;
};

export const PostApplicationsFilter = ({
  status,
  applicantId,
  createdDate,
  applicantOptions,
  onStatusChange,
  onApplicantChange,
  onCreatedDateChange,
}: PostApplicationsFilterProps) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    status,
    applicantId,
    createdDate,
  });

  const statusOptions = useMemo(
    () =>
      Object.entries(POST_APPLICATION_STATUS_FILTER_LABELS).map(
        ([value, label]) => ({
          value: value as PostApplicationStatusFilter[number],
          label,
        })
      ),
    []
  );

  const hasMobileFilters =
    status.length > 0 || applicantId !== 'all' || Boolean(createdDate);

  useEffect(() => {
    if (!isMobileFilterOpen) return;

    setTimeout(() => {
      setDraft({ status, applicantId, createdDate });
    }, 0);
  }, [isMobileFilterOpen, status, applicantId, createdDate]);

  const handleApply = () => {
    onStatusChange(draft.status);
    onApplicantChange(draft.applicantId);
    onCreatedDateChange(draft.createdDate);
    setIsMobileFilterOpen(false);
  };

  const handleReset = () => {
    setDraft({ status: [], applicantId: 'all', createdDate: null });
    onStatusChange([]);
    onApplicantChange('all');
    onCreatedDateChange(null);
    setIsMobileFilterOpen(false);
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          minWidth: 0,
          px: { xs: 1, md: 2 },
          alignItems: 'center',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <FilterStatusSelect
          size="small"
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
          sx={{ flex: 1, maxWidth: { md: 220 }, minWidth: 250 }}
        />

        <FilterAutocomplete
          label="Кандидат"
          size="small"
          value={applicantId}
          options={applicantOptions}
          onChange={onApplicantChange}
          sx={{ flex: 1, maxWidth: { md: 280 }, minWidth: 250 }}
        />

        <Box sx={{ flex: 1, minWidth: 180, maxWidth: { md: 220 } }}>
          <FilterDateField
            size="small"
            label="Дата создания"
            value={createdDate ?? ''}
            onChange={value => onCreatedDateChange(value || null)}
          />
        </Box>
      </Stack>

      <MobileFilterOpenButton
        active={isMobileFilterOpen || hasMobileFilters}
        onClick={() => setIsMobileFilterOpen(true)}
      />

      <Drawer
        anchor="right"
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: '80%' },
          },
        }}
      >
        <Stack
          direction="column"
          sx={{
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6">Фильтры</Typography>
              <IconButton onClick={() => setIsMobileFilterOpen(false)}>
                <Close />
              </IconButton>
            </Stack>

            <FilterStatusSelect
              value={draft.status}
              options={statusOptions}
              onChange={value =>
                setDraft(prev => ({
                  ...prev,
                  status: value,
                }))
              }
              sx={{ width: '100%' }}
            />

            <FilterAutocomplete
              label="Кандидат"
              value={draft.applicantId}
              options={applicantOptions}
              onChange={value =>
                setDraft(prev => ({
                  ...prev,
                  applicantId: value,
                }))
              }
              sx={{ width: '100%' }}
            />

            <FilterDateField
              label="Дата создания"
              value={draft.createdDate ?? ''}
              onChange={value =>
                setDraft(prev => ({
                  ...prev,
                  createdDate: value || null,
                }))
              }
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={mobileFilterActionsSx}
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
      </Drawer>
    </>
  );
};
