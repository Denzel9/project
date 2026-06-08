import { Tune } from '@mui/icons-material';
import { Button, Chip, IconButton, Stack, TextField } from '@mui/material';

import { useScroll } from '@/shared/hooks/useScroll';

import { FILTERS, FILTERS_VALUES } from '../model/constants';
import { useMainFilterStore } from '../model/store';

const MainFilter = () => {
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
    <Stack
      ref={ref}
      direction="row"
      sx={{
        p: 2,
        alignItems: 'center',
        transition: 'all 0.3s ease',
        justifyContent: 'space-between',
        bgcolor: isScrolled ? 'white' : 'transparent',
        boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        borderBottomLeftRadius: isScrolled ? '32px' : '0',
        borderBottomRightRadius: isScrolled ? '32px' : '0',
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ width: '50%' }}
      >
        <TextField
          label="Поиск"
          fullWidth
        />

        <Button variant="contained">Найти</Button>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center' }}
      >
        {FILTERS.map(({ label, value }) => (
          <Chip
            key={value}
            label={label}
            color={filters.includes(value) ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
            onClick={() => handleFilter(value)}
          />
        ))}

        <IconButton onClick={() => setIsOpenMainFilter(!isOpenMainFilter)}>
          {isOpenMainFilter ? <Tune color="primary" /> : <Tune />}
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default MainFilter;
