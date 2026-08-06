import { CalendarMonthOutlined } from '@mui/icons-material';
import { IconButton, Popover, Stack } from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { FilterAutocomplete } from '@/shared';
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter';

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

export const PostApplicationsFilter = ({
  status,
  applicantId,
  createdDate,
  applicantOptions,
  onStatusChange,
  onApplicantChange,
  onCreatedDateChange,
}: PostApplicationsFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const statusOptions = useMemo(
    () =>
      Object.entries(POST_APPLICATION_STATUS_FILTER_LABELS).map(
        ([id, label]) => ({
          id,
          label,
        })
      ),
    []
  );

  const handleDateChange = (date: Dayjs | null) => {
    onCreatedDateChange(date ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClearDate = () => {
    onCreatedDateChange(null);
    setAnchorEl(null);
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          px: { xs: 1, md: 2 },
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <IconButton
          color={createdDate ? 'primary' : 'default'}
          onClick={event => setAnchorEl(event.currentTarget)}
        >
          <CalendarMonthOutlined />
        </IconButton>

        <FilterAutocomplete
          label="Статус"
          size="small"
          value={status}
          options={statusOptions}
          onChange={value =>
            onStatusChange(value as PostApplicationStatusFilter)
          }
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
      </Stack>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '32px',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <DateCalendarFilter
          value={createdDate}
          onChange={handleDateChange}
          onClear={handleClearDate}
        />
      </Popover>
    </>
  );
};
