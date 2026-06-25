import { Close } from '@mui/icons-material';
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  BudgetTypeEnum,
  PlacementFormatEnum,
  PlatformEnum,
  WorkFormatEnum,
  getPlacementFormatLabel,
  getPlatformLabel,
  getWorkFormatLabel,
} from '@/entities/post';

import { useMainFilterStore } from '../model/store';

export const SideBarFilter = () => {
  const { setIsOpenMainFilter } = useMainFilterStore();

  const handleApply = () => {
    setIsOpenMainFilter(false);
  };

  return (
    <Stack
      spacing={3}
      direction="column"
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h6">Фильтры</Typography>
        <IconButton onClick={() => setIsOpenMainFilter(false)}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        label="Название"
        fullWidth
        disabled
      />

      <TextField
        label="Ключевые слова"
        fullWidth
        disabled
      />

      <TextField
        label="Тип бюджета"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        {Object.values(BudgetTypeEnum).map(option => (
          <MenuItem
            key={option}
            value={option}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Формат работы"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        {Object.values(WorkFormatEnum).map(option => (
          <MenuItem
            key={option}
            value={option}
          >
            {getWorkFormatLabel(option)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Площадка"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        {Object.values(PlatformEnum).map(option => (
          <MenuItem
            key={option}
            value={option}
          >
            {getPlatformLabel(option)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Формат размещения"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        {Object.values(PlacementFormatEnum).map(option => (
          <MenuItem
            key={option}
            value={option}
          >
            {getPlacementFormatLabel(option)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Срочность"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        <MenuItem value="true">Срочно</MenuItem>
        <MenuItem value="false">Не срочно</MenuItem>
      </TextField>

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
