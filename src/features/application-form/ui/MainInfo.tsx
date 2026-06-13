import { ChevronLeft } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { PostCooperationTypeEnum } from '@/entities/post';
import { RHFInput, RHFRadio } from '@/shared/ui/rhf';

import MenuButton from './MenuButton';

import type { ChangeEvent } from 'react';

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

  const { chips, typeCooperation } = useWatch({
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
        chips.filter(type => type !== value)
      );
    } else {
      setValue('chips', [...chips, value]);
    }
  };

  const handleChangeTypeCooperation = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (typeCooperation.includes(value)) {
      setValue(
        'typeCooperation',
        typeCooperation.filter(type => type !== value)
      );
    } else {
      setValue('typeCooperation', [...typeCooperation, value]);
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
          name="typeCooperation"
          control={control}
          render={({ fieldState }) => (
            <TextField
              select
              label="Тип сотрудничества"
              error={!!fieldState?.error}
              value={typeCooperation || ''}
              helperText={fieldState?.error?.message}
              onChange={handleChangeTypeCooperation}
              sx={{ width: { lg: '50%', xs: '100%' } }}
            >
              <MenuItem value={PostCooperationTypeEnum.ONE_TIME}>
                Разовое сотрудничество
              </MenuItem>
              <MenuItem value={PostCooperationTypeEnum.LONG_TIME}>
                Постоянное сотрудничество
              </MenuItem>
            </TextField>
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
