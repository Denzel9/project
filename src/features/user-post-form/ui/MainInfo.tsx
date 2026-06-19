import { ChevronLeft } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RHFInput } from '@/shared';

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
            {isEdit ? 'Редактирование поста' : 'Новый пост'}
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
      </Box>
    </Box>
  );
};
