import { CalendarMonthOutlined, Search, Tune } from '@mui/icons-material';
import {
  Drawer,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { APPLICATION_STATUS_LABELS } from '@/entities';
import { useScroll } from '@/shared';
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter';

import { useMyPostFilterStore } from '../model/store';

import { ApplicationSearchPanel } from './ApplicationSearchPanel';
import { MyPostSideBarFilter } from './MyPostSideBarFilter';

import type { ApplicationStatusFilter } from '../model/utils';

const MyPostFilter = () => {
  const { isScrolled, ref } = useScroll(150);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const {
    postId,
    setPostId,
    posts,
    status,
    setStatus,
    q,
    updatedDate,
    setUpdatedDate,
    isOpenFilter,
    setIsOpenFilter,
  } = useMyPostFilterStore();

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const postOptions = useMemo(() => {
    const map = new Map<string, string>();

    posts?.items.forEach(application => {
      const id = application.post?.id;
      const title = application.post?.title;

      if (id && title) {
        map.set(id, title);
      }
    });

    return Array.from(map.entries());
  }, [posts]);

  const hasActiveSidebarFilters =
    status !== 'all' || postId !== 'all' || Boolean(q.trim());

  const handleDateChange = (date: Dayjs | null) => {
    setUpdatedDate(date ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClearDate = () => {
    setUpdatedDate(null);
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
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: '50%' }}
        >
          <TextField
            select
            fullWidth
            label="Статус"
            value={status}
            size={isMobile ? 'small' : 'medium'}
            onChange={event =>
              setStatus(event.target.value as ApplicationStatusFilter)
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

          <TextField
            select
            fullWidth
            value={postId}
            label="Объявление"
            size={isMobile ? 'small' : 'medium'}
            onChange={event => setPostId(event.target.value)}
          >
            <MenuItem value="all">Все</MenuItem>
            {postOptions.map(([id, title]) => (
              <MenuItem
                key={id}
                value={id}
              >
                {title}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
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

          <IconButton
            onClick={() => setIsOpenFilter(!isOpenFilter)}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
            color={
              isOpenFilter || hasActiveSidebarFilters ? 'primary' : 'default'
            }
          >
            <Tune />
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
        open={isOpenFilter}
        onClose={() => setIsOpenFilter(false)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            width: { xs: '100%', sm: '80%', md: '25%' },
            display: { xs: 'block', md: 'none' },
          },
        }}
      >
        <MyPostSideBarFilter />
      </Drawer>
    </>
  );
};

export default MyPostFilter;
