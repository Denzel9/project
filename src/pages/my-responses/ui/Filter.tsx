import { CalendarMonthOutlined, Search } from '@mui/icons-material';
import {
  Drawer,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
} from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { APPLICATION_STATUS_LABELS } from '@/entities';
import { SideBarFilter, useMainFilterStore } from '@/features';
import { useScroll } from '@/shared';
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter';

import { ApplicationSearchPanel } from './ApplicationSearchPanel';

import type { ApplicationStatusFilter } from '../model/utils';

type MyResponsesFilterProps = {
  status: ApplicationStatusFilter;
  onStatusChange: (value: ApplicationStatusFilter) => void;
  updatedDate: string | null;
  onUpdatedDateChange: (value: string | null) => void;
};

const MyResponsesFilter = ({
  status,
  onStatusChange,
  updatedDate,
  onUpdatedDateChange,
}: MyResponsesFilterProps) => {
  const { isScrolled, ref } = useScroll(150);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { isOpenMainFilter, setIsOpenMainFilter } = useMainFilterStore();

  const handleDateChange = (date: Dayjs | null) => {
    onUpdatedDateChange(date ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClearDate = () => {
    onUpdatedDateChange(null);
    setAnchorEl(null);
  };

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        sx={{
          px: 2,
          pb: 2,
          alignItems: 'center',
          pt: isScrolled ? 4 : 1,
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
          bgcolor: isScrolled ? 'white' : 'transparent',
          borderBottomLeftRadius: isScrolled ? '32px' : '0',
          borderBottomRightRadius: isScrolled ? '32px' : '0',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <TextField
          select
          label="Статус"
          value={status}
          size="small"
          sx={{ width: { xs: '90%', md: '20%' } }}
          onChange={e =>
            onStatusChange(e.target.value as ApplicationStatusFilter)
          }
        >
          <MenuItem value="all">Все</MenuItem>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
            <MenuItem
              key={value}
              value={value}
            >
              {label}
            </MenuItem>
          ))}
        </TextField>

        <Stack
          direction="row"
          spacing={2}
        >
          <IconButton
            color={updatedDate ? 'primary' : 'default'}
            onClick={event => setAnchorEl(event.currentTarget)}
          >
            <CalendarMonthOutlined />
          </IconButton>

          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>
        </Stack>
      </Stack>

      <ApplicationSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

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
          value={updatedDate}
          onChange={handleDateChange}
          onClear={handleClearDate}
        />
      </Popover>

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(!isOpenMainFilter)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            width: { xs: '100%', sm: '80%', md: '25%' },
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32,
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </>
  );
};

export default MyResponsesFilter;
