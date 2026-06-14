import { Search, Tune } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';

import { POST_TYPE_ENUM } from '@/entities/post';
import { useScroll } from '@/shared/hooks/useScroll';

import { FILTERS, FILTERS_VALUES } from '../model/constants';
import { useMainFilterStore } from '../model/store';

import { PostSearchPanel } from './PostSearchPanel';

const MainFilter = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    isOpenMainFilter,
    setIsOpenMainFilter,
    filters,
    setFilters,
    postsType,
    setPostsType,
  } = useMainFilterStore();

  const { isScrolled, ref } = useScroll(150);

  const handleFilter = (filter: FILTERS_VALUES) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
    } else {
      setFilters([...filters, filter]);
    }
  };

  return (
    <>
      <Stack
        ref={ref}
        spacing={2}
        direction="row"
        sx={{
          p: 2,
          alignItems: 'center',
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
          value={postsType}
          size={isMobile ? 'small' : 'medium'}
          sx={{ width: { xs: '90%', md: '50%' } }}
          onChange={e => setPostsType(e.target.value as POST_TYPE_ENUM)}
        >
          <MenuItem value={POST_TYPE_ENUM.ALL}>Все</MenuItem>
          <MenuItem value={POST_TYPE_ENUM.COMPANY}>Компании</MenuItem>
          <MenuItem value={POST_TYPE_ENUM.CREATOR}>Креаторы</MenuItem>
        </TextField>

        <Stack
          direction="row"
          spacing={{ xs: 1, md: 2 }}
          sx={{ alignItems: 'center' }}
        >
          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>

          <IconButton onClick={() => setIsOpenMainFilter(!isOpenMainFilter)}>
            {isOpenMainFilter ? <Tune color="primary" /> : <Tune />}
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {FILTERS.map(({ label, value }) => (
              <Chip
                key={value}
                label={label}
                color={filters.includes(value) ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleFilter(value)}
              />
            ))}
          </Box>
        </Stack>
      </Stack>

      <PostSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default MainFilter;
