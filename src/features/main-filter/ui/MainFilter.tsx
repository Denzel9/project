import { Search, Tune } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack } from '@mui/material';
import { useState } from 'react';

import { useScroll } from '@/shared';

import { FILTERS, FILTERS_VALUES } from '../model/constants';
import { useMainFilterStore } from '../model/store';

import { PostSearchPanel } from './PostSearchPanel';

export const MainFilter = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isOpenMainFilter, setIsOpenMainFilter, filters, setFilters } =
    useMainFilterStore();

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
        direction="row"
        sx={{
          px: 2,
          pb: 2,
          pt: isScrolled ? 4 : 1,
          alignItems: 'center',
          transition: 'all 0.3s ease',
          justifyContent: { xs: 'space-between', md: 'flex-end' },
          bgcolor: isScrolled ? 'white' : 'transparent',
          borderBottomLeftRadius: isScrolled ? '32px' : '0',
          borderBottomRightRadius: isScrolled ? '32px' : '0',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Chip
          label={FILTERS[0].label}
          onClick={() => handleFilter(FILTERS[0].value)}
          sx={{ cursor: 'pointer', display: { xs: 'flex', md: 'none' } }}
          color={filters.includes(FILTERS[0].value) ? 'primary' : 'default'}
        />

        <Stack
          direction="row"
          spacing={{ xs: 1, md: 1 }}
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
