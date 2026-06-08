import { Chip, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';

const FavoriteFilter = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('all');

  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        alignItems: 'center',
        transition: 'all 0.3s ease',
        justifyContent: 'space-between',
      }}
    >
      <TextField
        label="Подборки"
        select
        value={collections}
        sx={{ width: '35%' }}
        onChange={e => setCollections([...collections, e.target.value])}
      >
        <MenuItem value="1">Косметика</MenuItem>
        <MenuItem value="2">Эстетические</MenuItem>
        <MenuItem value="3">Косметологические</MenuItem>
        <MenuItem value="4">Фотомодельные</MenuItem>
        <MenuItem value="5">Модельные</MenuItem>
        <MenuItem value="6">Режиссёрские</MenuItem>
        <MenuItem value="7">Технические</MenuItem>
        <MenuItem value="8">Остальные</MenuItem>
      </TextField>

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center' }}
      >
        <Chip
          label="Все"
          color={status === 'all' ? 'primary' : 'default'}
          onClick={() => setStatus('all')}
        />
        <Chip
          label="В работе"
          color={status === 'in_progress' ? 'primary' : 'default'}
          onClick={() => setStatus('in_progress')}
        />
        <Chip
          label="Завершенные"
          color={status === 'completed' ? 'primary' : 'default'}
          onClick={() => setStatus('completed')}
        />
      </Stack>
    </Stack>
  );
};

export default FavoriteFilter;
