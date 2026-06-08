import { Typography, Box, RadioGroup } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { RHFInput, RHFRadio, RHFSwitch } from '@/shared/ui/rhf';

export const ProductInfo = () => {
  const { control, setValue } = useFormContext();

  const { contentType, finalPrice } = useWatch({
    control,
  });

  return (
    <Box sx={{ width: { lg: '50%', xs: '100%' } }}>
      <Typography variant="h6">Информация о заявке</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <RHFInput
          name="description"
          control={control}
          maxLength={400}
          props={{
            rows: 5,
            fullWidth: true,
            multiline: true,
            label: 'Описание',
            sx: { mt: 2 },
          }}
        />

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Тип контента
          </Typography>

          <RadioGroup
            sx={{
              gap: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RHFRadio
              label="Только фото"
              name="contentType"
              control={control}
              props={{ value: 'photo' }}
              description="Предполагается только фото контент."
            />

            <RHFRadio
              name="contentType"
              label="Только видео"
              control={control}
              props={{ value: 'video' }}
              description="Предполагается только видео контент."
            />

            <RHFRadio
              label="Видео и фото"
              name="contentType"
              control={control}
              props={{ value: 'photoAndVideo' }}
              description="Предполагается видео и фото контент."
            />
          </RadioGroup>
        </Box>

        {contentType === 'photoAndVideo' ? (
          <>
            <RHFInput
              name="photoCount"
              control={control}
              props={{
                fullWidth: true,
                label: `Кол-во фото`,
                sx: { width: { lg: '50%', xs: '100%' } },
              }}
            />
            <RHFInput
              name="videoCount"
              control={control}
              props={{
                fullWidth: true,
                label: `Кол-во видео`,
                sx: { width: { lg: '50%', xs: '100%' } },
              }}
            />
          </>
        ) : (
          <RHFInput
            name={contentType === 'photo' ? 'photoCount' : 'videoCount'}
            control={control}
            props={{
              fullWidth: true,
              label: `Кол-во ${contentType === 'photo' ? 'фото' : 'видео'} `,
              sx: { width: { lg: '50%', xs: '100%' } },
            }}
          />
        )}
      </Box>

      <RHFSwitch
        name="finalPrice"
        control={control}
        label="Окончательная цена"
        props={{
          sx: { width: { lg: '50%', xs: '100%' }, mt: 4, mb: 3 },
          checked: finalPrice,
          onChange: e => {
            setValue('finalPrice', e.target.checked);
          },
        }}
      />

      {finalPrice ? (
        <RHFInput
          name="price"
          control={control}
          endAdornment="₽"
          props={{
            label: 'Цена',
            fullWidth: true,
            sx: { width: { lg: '50%', xs: '100%' } },
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <RHFInput
            name="price"
            control={control}
            endAdornment="₽"
            startAdornment="от"
            props={{
              label: 'Цена',
              sx: { width: { lg: '50%', xs: '100%' } },
            }}
          />
          -
          <RHFInput
            name="price"
            startAdornment="до"
            control={control}
            endAdornment="₽"
            props={{
              label: 'Цена',
              sx: { width: { lg: '50%', xs: '100%' } },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
