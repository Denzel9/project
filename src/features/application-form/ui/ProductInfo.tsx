import { Typography, Box, RadioGroup, Switch } from '@mui/material';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { PostContentTypeEnum } from '@/entities/post';
import { RHFInput, RHFRadio } from '@/shared/ui/rhf';

export const ProductInfo = () => {
  const [isFinalPrice, setIsFinalPrice] = useState<boolean>(true);

  const { control } = useFormContext();

  const { contentType } = useWatch({
    control,
  });

  const handleChangeFinalPrice = () => {
    setIsFinalPrice(!isFinalPrice);
  };

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
              props={{ value: PostContentTypeEnum.PHOTO }}
              description="Предполагается только фото контент."
            />

            <RHFRadio
              name="contentType"
              label="Только видео"
              control={control}
              props={{ value: PostContentTypeEnum.VIDEO }}
              description="Предполагается только видео контент."
            />

            <RHFRadio
              label="Видео и фото"
              name="contentType"
              control={control}
              props={{ value: PostContentTypeEnum.PHOTO_VIDEO }}
              description="Предполагается видео и фото контент."
            />
          </RadioGroup>
        </Box>

        {contentType === PostContentTypeEnum.PHOTO_VIDEO ? (
          <>
            <RHFInput
              name="photoCount"
              control={control}
              props={{
                fullWidth: true,
                label: 'Кол-во фото',
                sx: { width: { lg: '50%', xs: '100%' } },
              }}
            />
            <RHFInput
              name="videoCount"
              control={control}
              props={{
                fullWidth: true,
                label: 'Кол-во видео',
                sx: { width: { lg: '50%', xs: '100%' } },
              }}
            />
          </>
        ) : (
          <RHFInput
            name={
              contentType === PostContentTypeEnum.PHOTO
                ? 'photoCount'
                : 'videoCount'
            }
            control={control}
            props={{
              fullWidth: true,
              label: `Кол-во ${contentType === PostContentTypeEnum.PHOTO ? 'фото' : 'видео'} `,
              sx: { width: { lg: '50%', xs: '100%' } },
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          my: 4,
          justifyContent: 'space-between',
          width: { lg: '50%', xs: '100%' },
        }}
      >
        <Typography variant="body1">Окончательная цена</Typography>
        <Switch
          checked={isFinalPrice}
          onChange={handleChangeFinalPrice}
        />
      </Box>

      {isFinalPrice ? (
        <RHFInput
          name="finalPrice"
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
            name="rangePrice"
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
            name="rangePrice"
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
