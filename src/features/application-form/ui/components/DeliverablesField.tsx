import { Close } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import {
  PlacementFormatEnum,
  type PlacementFormat,
  type Platform,
  getPlacementFormatLabel,
  getPlatformLabel,
} from '@/entities/post';
import { RHFInput } from '@/shared/ui/rhf';

import { DeliverablePresetChips } from './DeliverablePresetChips';

type DeliverablesFieldProps = {
  fieldName?: string;
};

type DeliverableRowProps = {
  index: number;
  platform: Platform;
  format: PlacementFormat;
  fieldName: string;
  onRemove: () => void;
};

const DeliverableRow = ({
  index,
  platform,
  format,
  fieldName,
  onRemove,
}: DeliverableRowProps) => {
  const { control, setValue } = useFormContext();

  const showsDuration = format !== PlacementFormatEnum.POST;

  useEffect(() => {
    if (!showsDuration) {
      setValue(`${fieldName}.${index}.durationSec`, '');
    }
  }, [showsDuration, fieldName, index, setValue]);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 20px rgba(77, 144, 142, 0.12)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 16,
          bottom: 16,
          left: 0,
          width: 4,
          borderRadius: '0 4px 4px 0',
          bgcolor: 'primary.main',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          pl: 1,
          mb: 2.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={0}
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              display: 'flex',
              flexShrink: 0,
              borderRadius: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'info.light',
              color: 'primary.main',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, lineHeight: 1 }}
            >
              {index + 1}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={getPlatformLabel(platform)}
            sx={{
              fontWeight: 600,
              bgcolor: 'secondary.light',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />

          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={getPlacementFormatLabel(format)}
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <IconButton
          size="small"
          aria-label="Удалить позицию"
          onClick={onRemove}
          sx={{
            flexShrink: 0,
            color: 'text.secondary',
            bgcolor: 'secondary.light',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'error.light',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      <Stack
        spacing={2}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ pl: 1 }}
      >
        <RHFInput
          control={control}
          name={`${fieldName}.${index}.count`}
          props={{
            size: 'small',
            label: 'Количество',
            sx: {
              flex: 1,
              minWidth: { sm: 140 },
              maxWidth: { xs: '100%', md: '50%' },
            },
          }}
        />

        {showsDuration && (
            <RHFInput
              control={control}
              name={`${fieldName}.${index}.durationSec`}
            props={{
              size: 'small',
              label: 'Длительность, сек.',
              sx: { flex: 1, minWidth: { sm: 160 } },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export const DeliverablesField = ({
  fieldName = 'deliverables',
}: DeliverablesFieldProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  const deliverables = useWatch({ control, name: fieldName }) ?? [];

  const handleAddPreset = (platform: Platform, format: PlacementFormat) => {
    append({
      platform,
      format,
      count: '1',
      durationSec: '',
    });
  };

  return (
    <Stack spacing={2.5}>
      <DeliverablePresetChips onAdd={handleAddPreset} />

      {fields?.map((field, index) => {
        const item = deliverables[index];

        return (
          <DeliverableRow
            index={index}
            key={field.id}
            fieldName={fieldName}
            onRemove={() => remove(index)}
            platform={item?.platform as Platform}
            format={item?.format as PlacementFormat}
          />
        );
      })}
    </Stack>
  );
};
