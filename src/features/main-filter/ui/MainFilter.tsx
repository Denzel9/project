import { Close, Search, Tune } from '@mui/icons-material';
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useRef } from 'react';

import { scrollMainToTop, useScroll } from '@/shared';

import { FILTERS, FILTERS_VALUES } from '../model/constants';
import { useMainFilterStore } from '../model/store';
import { hasActivePostFilters } from '../model/utils';

import { PostSearchPanel } from './PostSearchPanel';
import { SideBarFilter } from './SideBarFilter';

export const MainFilter = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const {
    filters,
    setFilters,
    postFilters,
    resetAllFilters,
    isOpenMainFilter,
    setIsOpenMainFilter,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
  } = useMainFilterStore();

  const { isScrolled, ref } = useScroll(150);
  const hasSidebarFilters = hasActivePostFilters(postFilters);
  const hasAnyFilters = filters.length > 0 || hasSidebarFilters;
  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }

    scrollMainToTop('smooth');
  }, [filters, postFilters]);

  const handleFilter = (filter: FILTERS_VALUES) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
    } else {
      setFilters([...filters, filter]);
    }
  };

  const renderFastFilterChip = (label: string, value: FILTERS_VALUES) => (
    <Chip
      key={value}
      label={label}
      sx={{ cursor: 'pointer', flexShrink: 0 }}
      onClick={() => handleFilter(value)}
      color={filters.includes(value) ? 'primary' : 'default'}
    />
  );

  return (
    <>
      <Stack
        ref={ref}
        direction="column"
        spacing={1}
        sx={{
          p: 2,
          mb: 1,
          bgcolor: 'white',
          border: '1px solid',
          borderRadius: '24px',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box
            sx={{
              gap: 1,
              flex: 1,
              display: 'flex',
              minWidth: 0,
              overflowX: 'auto',
              alignItems: 'center',
            }}
          >
            {FILTERS.map(({ label, value }) =>
              renderFastFilterChip(label, value)
            )}

            {hasAnyFilters && (
              <Chip
                label="Сбросить"
                variant="outlined"
                onClick={resetAllFilters}
                sx={{ flexShrink: 0 }}
              />
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexShrink: 0 }}
          >
            {isSearchOpen && !isMobile && (
              <TextField
                autoFocus
                label="Поиск"
                size="small"
                variant="outlined"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                sx={{ width: 300 }}
              />
            )}

            <IconButton onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <Close /> : <Search />}
            </IconButton>

            <IconButton onClick={() => setIsOpenMainFilter(!isOpenMainFilter)}>
              {isOpenMainFilter || hasAnyFilters ? (
                <Tune color="primary" />
              ) : (
                <Tune />
              )}
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <PostSearchPanel
        open={isSearchOpen && isMobile}
        onClose={() => setIsSearchOpen(false)}
      />

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(false)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            borderTopLeftRadius: { xs: 0, md: 32 },
            borderBottomLeftRadius: { xs: 0, md: 32 },
            width: { xs: '100%', sm: '80%', md: '25%' },
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </>
  );
};
