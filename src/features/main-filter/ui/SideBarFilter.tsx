import { Button, MenuItem, Stack, TextField } from '@mui/material';

import { useMainFilterStore } from '../model/store';

export const SideBarFilter = () => {
  const { setIsOpenMainFilter } = useMainFilterStore();

  const handleApply = () => {
    setIsOpenMainFilter(false);
  };
  return (
    <Stack
      spacing={4}
      direction="column"
    >
      <TextField
        id="excludeWords"
        label="Исключить слова"
        fullWidth
      />

      <TextField
        label="Уровень дохода"
        fullWidth
      />

      <TextField
        label="Частота выплат"
        fullWidth
        select
      >
        <MenuItem value="1">Ежемесячно</MenuItem>
        <MenuItem value="2">Ежеквартально</MenuItem>
        <MenuItem value="3">Ежегодно</MenuItem>
      </TextField>

      <TextField
        label="Специальность"
        fullWidth
      />

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleApply}
      >
        Применить
      </Button>
    </Stack>
  );
};
