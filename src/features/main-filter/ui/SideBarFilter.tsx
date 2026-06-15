import { Close } from '@mui/icons-material';
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { PostContentTypeEnum, PostCooperationTypeEnum } from '@/entities/post';

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
        label="Цена от"
        fullWidth
        disabled
      />

      <TextField
        label="Цена до"
        fullWidth
        disabled
      />

      <TextField
        label="Тип сотрудничества"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        <MenuItem value={PostCooperationTypeEnum.ONE_TIME}>
          Разовое сотрудничество
        </MenuItem>
        <MenuItem value={PostCooperationTypeEnum.LONG_TIME}>
          Постоянное сотрудничество
        </MenuItem>
      </TextField>

      <TextField
        label="Тип контента"
        fullWidth
        select
        disabled
        defaultValue=""
      >
        <MenuItem value={PostContentTypeEnum.PHOTO}>Только фото</MenuItem>
        <MenuItem value={PostContentTypeEnum.VIDEO}>Только видео</MenuItem>
        <MenuItem value={PostContentTypeEnum.PHOTO_VIDEO}>
          Фото и видео
        </MenuItem>
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
