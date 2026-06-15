import { Search } from '@mui/icons-material';
import {
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
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
};

const MyResponsesFilter = ({
  postType,
  onPostTypeChange,
  status,
  onStatusChange,
}: MyResponsesFilterProps) => {
  const { isScrolled, ref } = useScroll(150);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isOpenMainFilter, setIsOpenMainFilter } = useMainFilterStore();

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

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

        <IconButton onClick={() => setIsSearchOpen(true)}>
          <Search />
        </IconButton>
      </Stack>

      <ApplicationSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

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
