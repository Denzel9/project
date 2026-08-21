import { Close, Search } from '@mui/icons-material';
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useRef } from 'react';

import {
  MobileFilterOpenButton,
  scrollMainToTop,
  useScroll,
} from '@/shared';

import { FILTERS, FILTERS_VALUES } from '../model/constants';
import { useMainFilterStore } from '../model/store';
import { hasActivePostFilters } from '../model/utils';

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

  const { isScrolled, ref } = useScroll(80);
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

  const handleFastFiltersSelect = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setFilters(
      typeof value === 'string'
        ? value
          ? (value.split(',') as FILTERS_VALUES[])
          : []
        : (value as unknown as FILTERS_VALUES[]),
    );
  };

  const renderFastFilterChip = (label: string, value: FILTERS_VALUES) => (
    <Chip
      key={value}
      label={label}
      size={isMobile ? 'small' : 'medium'}
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
          bgcolor: 'background.paper',
          border: '1px solid',
          borderRadius: '24px',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          borderTopLeftRadius: isScrolled ? '0' : '24px',
          borderTopRightRadius: isScrolled ? '0' : '24px',
          borderTopColor: isScrolled ? 'transparent' : 'divider',
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
              minWidth: 0,
              overflowX: 'auto',
              alignItems: 'center',
              display: { xs: 'none', md: 'flex' },
            }}
          >
            {FILTERS.map(({ label, value }) =>
              renderFastFilterChip(label, value),
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

          <TextField
            select
            size="small"
            label="Быстрый фильтр"
            value={filters}
            onChange={handleFastFiltersSelect}
            sx={{
              flex: 1,
              minWidth: 0,
              display: {
                xs: isSearchOpen ? 'none' : 'flex',
                md: 'none',
              },
            }}
            slotProps={{
              inputLabel: { shrink: true },
              select: {
                multiple: true,
                displayEmpty: true,
                renderValue: selected => {
                  const values = selected as FILTERS_VALUES[];
                  if (!values.length) return 'Не выбрано';
                  return FILTERS.filter(item => values.includes(item.value))
                    .map(item => item.label)
                    .join(', ');
                },
              },
            }}
          >
            {FILTERS.map(({ label, value }) => (
              <MenuItem
                key={value}
                value={value}
              >
                {label}
              </MenuItem>
            ))}
          </TextField>

          <Stack
            spacing={1}
            direction="row"
            sx={{
              alignItems: 'center',
              flexShrink: 0,
              flex: isSearchOpen && isMobile ? 1 : undefined,
              minWidth: 0,
            }}
          >
            {isSearchOpen && (
              <TextField
                autoFocus
                label="Поиск"
                size="small"
                variant="outlined"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                sx={{
                  width: { xs: '100%', md: 300 },
                  minWidth: 0,
                  flex: { xs: 1, md: 'none' },
                }}
              />
            )}

            <IconButton onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <Close /> : <Search />}
            </IconButton>

            <MobileFilterOpenButton
              active={isOpenMainFilter || hasAnyFilters}
              onClick={() => setIsOpenMainFilter(!isOpenMainFilter)}
              sx={{ display: 'inline-flex' }}
            />
          </Stack>
        </Stack>
      </Stack>

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
