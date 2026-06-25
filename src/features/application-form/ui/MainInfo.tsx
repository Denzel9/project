import { ChevronLeft } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { WorkFormatEnum, getWorkFormatLabel } from '@/entities/post';
import { RHFInput, RHFRadio, RHFSwitch } from '@/shared/ui/rhf';

import MenuButton from './MenuButton';

const ADVANTAGE_OPTIONS = [
  'Удаленно',
  'На месте работадатель',
  'По договору',
  'Подтвержденный аккаунт',
];

type Props = {
  isEdit?: boolean;
};

const options = ['Удалить', 'Сохранить как черновик'];

export const MainInfo = ({ isEdit = false }: Props) => {
  const { control, setValue } = useFormContext();

  const { chips } = useWatch({
    control,
  });

  const navigate = useNavigate();

  // const { handleOpenConfirmModal, handleDelete, handleGoToPreview } =
  //   useActions({ getValues, id });

  const handleAction = () => {
    // if (action === 'Предпросмотр') handleGoToPreview();
    // if (action === 'Удалить') handleOpenConfirmModal();
  };

  const handleSetChips = (value: string) => {
    if (chips.includes(value)) {
      setValue(
        'chips',
        chips.filter((type: string) => type !== value)
      );
    } else {
      setValue('chips', [...chips, value]);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <IconButton onClick={() => navigate(-1)}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: 20, lg: 30 },
              display: { xs: 'none', lg: 'block' },
            }}
          >
            {isEdit ? 'Редактирование обьявления' : 'Новое обьявление'}
          </Typography>
        </Box>

        <MenuButton
          options={options}
          onAction={handleAction}
        />
      </Box>

      <Box sx={{ width: { lg: '50%', xs: '100%' } }}>
        <RHFInput
          name="title"
          control={control}
          maxLength={40}
          props={{
            sx: { my: 4 },
            fullWidth: true,
            label: 'Название',
            helperText: 'Например, «UGС Creator», Bloger, «Model»',
          }}
        />

        <Box
          sx={{
            mb: 4,
            gap: 1,
            display: 'flex',
            flexWrap: 'wrap',
            width: { lg: '70%', xs: '100%' },
          }}
        >
          {ADVANTAGE_OPTIONS.map(option => (
            <Chip
              key={option}
              label={option}
              onClick={() => handleSetChips(option)}
              color={chips.includes(option) ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <Controller
          name="workFormat"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Формат работы"
              error={!!fieldState?.error}
              value={field.value || ''}
              helperText={fieldState?.error?.message}
              onChange={field.onChange}
              sx={{ width: { lg: '50%', xs: '100%' } }}
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
          )}
        />

        <Box sx={{ my: 4 }}>
          <RHFSwitch
            name="isPrivate"
            control={control}
            label="Приватное объявление"
            description="Видно только Вам"
          />
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Срочность
          </Typography>

          <RadioGroup
            sx={{
              gap: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RHFRadio
              label="Срочно"
              name="urgent"
              control={control}
              props={{ value: true }}
              description="Выполнение задания за 1-3 дня"
            />

            <RHFRadio
              name="urgent"
              label="Не срочно"
              control={control}
              props={{ value: false }}
              description="Выполнение задания по договоренности"
            />
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  );
};
