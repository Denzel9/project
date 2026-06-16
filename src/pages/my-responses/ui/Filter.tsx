import { CalendarMonthOutlined, Search } from '@mui/icons-material';
import {
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { APPLICATION_STATUS_LABELS } from '@/entities/application';
import { POST_TYPE_ENUM } from '@/entities/post';
import { useMainFilterStore } from '@/features/main-filter';
import { SideBarFilter } from '@/features/main-filter/ui/SideBarFilter';
import { useScroll } from '@/shared/hooks/useScroll';

import { ApplicationSearchPanel } from './ApplicationSearchPanel';

import type { ApplicationStatusFilter } from '../model/utils';

type MyResponsesFilterProps = {
  postType: POST_TYPE_ENUM;
  onPostTypeChange: (value: POST_TYPE_ENUM) => void;
  status: ApplicationStatusFilter;
  onStatusChange: (value: ApplicationStatusFilter) => void;
  updatedDate: string | null;
  onUpdatedDateChange: (value: string | null) => void;
};

const MyResponsesFilter = ({
  postType,
  onPostTypeChange,
  status,
  onStatusChange,
  updatedDate,
  onUpdatedDateChange,
}: MyResponsesFilterProps) => {
  const { isScrolled, ref } = useScroll(150);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { isOpenMainFilter, setIsOpenMainFilter } = useMainFilterStore();

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

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
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
          bgcolor: isScrolled ? 'white' : 'transparent',
          borderBottomLeftRadius: isScrolled ? '32px' : '0',
          borderBottomRightRadius: isScrolled ? '32px' : '0',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: '100%' }}
        >
          <TextField
            select
            label="Тип"
            value={postType}
            size={isMobile ? 'small' : 'medium'}
            sx={{ width: { xs: '90%', md: '20%' } }}
            onChange={e => onPostTypeChange(e.target.value as POST_TYPE_ENUM)}
          >
            <MenuItem value={POST_TYPE_ENUM.ALL}>Все</MenuItem>
            <MenuItem value={POST_TYPE_ENUM.COMPANY}>Компании</MenuItem>
            <MenuItem value={POST_TYPE_ENUM.CREATOR}>Креаторы</MenuItem>
          </TextField>

          <TextField
            select
            label="Статус"
            value={status}
            size={isMobile ? 'small' : 'medium'}
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
        </Stack>

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
        <DateCalendar
          value={updatedDate ? dayjs(updatedDate) : null}
          onChange={handleDateChange}
          views={['year', 'month', 'day']}
        />
        {updatedDate && (
          <Button
            fullWidth
            onClick={handleClearDate}
            sx={{ mb: 2, mx: 2, width: 'calc(100% - 32px)' }}
          >
            Все даты
          </Button>
        )}
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
