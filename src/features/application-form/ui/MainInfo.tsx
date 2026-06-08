import { ChevronLeft } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RHFInput, RHFRadio } from '@/shared/ui/rhf';

import MenuButton from './MenuButton';

const ADVANTAGE_OPTIONS = [
  'Удаленно',
  'На месте работадатель',
  'По договору',
  'Подтвержденный аккаунт',
];

type Props = {
  id: string;
  isEdit?: boolean;
};

const options = ['Удалить', 'Сохранить как черновик'];

export const MainInfo = ({ id, isEdit = false }: Props) => {
  const { control, setValue } = useFormContext();

  const { advantage } = useWatch({
    control,
  });

  const navigate = useNavigate();

  // const { handleOpenConfirmModal, handleDelete, handleGoToPreview } =
  //   useActions({ getValues, id });

  const handleAction = (action: string) => {
    // if (action === 'Предпросмотр') handleGoToPreview();
    // if (action === 'Удалить') handleOpenConfirmModal();
  };

  const handleSetAdvantage = (value: string) => {
    if (advantage.includes(value)) {
      setValue(
        'advantage',
        advantage.filter(type => type !== value)
      );
    } else {
      setValue('advantage', [...advantage, value]);
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

        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            variant="text"
            onClick={() => {}}
            size="small"
          >
            Расширенные настройки
          </Button>
          <MenuButton
            options={options}
            onAction={handleAction}
          />
        </Stack>
      </Box>

      <Box sx={{ width: { lg: '50%', xs: '100%' } }}>
        <RHFInput
          name="name"
          control={control}
          maxLength={40}
          props={{
            sx: { my: 4 },
            fullWidth: true,
            label: 'Роль',
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
              onClick={() => handleSetAdvantage(option)}
              color={advantage.includes(option) ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <Controller
          name="cooperationType"
          control={control}
          render={({ field: { value, onChange }, fieldState }) => (
            <Autocomplete
              multiple
              value={value || []}
              options={[]}
              filterSelectedOptions
              getOptionLabel={option => option || ''}
              onChange={(_, newValue) => onChange(newValue)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Тип сотрудничества"
                  error={!!fieldState?.error}
                  helperText={fieldState?.error?.message}
                  sx={{ width: { lg: '50%', xs: '100%' } }}
                />
              )}
            />
          )}
        />

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
              name="condition"
              control={control}
              props={{ value: 'Новое' }}
              description="Срочно нужна помощь в выполнении задания."
            />

            <RHFRadio
              name="condition"
              label="Не срочно"
              control={control}
              props={{ value: 'Не срочно' }}
              description="Не срочно нужна помощь в выполнении задания."
            />

            <RHFRadio
              label="Другое"
              name="condition"
              control={control}
              props={{ value: 'Другое' }}
              description="Другой тип сотрудничества."
            />
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  );
};
