import { Box, Chip, Stack, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  formatPostDeliverable,
  getPlacementFormatLabel,
  getPlatformLabel,
  type PlacementFormat,
  type Platform,
} from '@/entities/post';
import { DeliverablesField } from '@/features/application-form/ui/components/DeliverablesField';

import type { TaskDeliverableFormItem } from '../model/deliverablesMappers';
import type { TaskFormType } from '../model/schema/schema';

type TaskDeliverablesSectionProps = {
  isEdit: boolean;
};

const toPostDeliverable = (item: TaskDeliverableFormItem) => ({
  platform: item.platform as Platform,
  format: item.format as PlacementFormat,
  count: Number(item.count) || 1,
  durationSec: item.durationSec?.trim() ? Number(item.durationSec) : undefined,
});

const DeliverableViewCard = ({
  item,
  index,
}: {
  item: TaskDeliverableFormItem;
  index: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      p: { xs: 2, sm: 2.5 },
      borderRadius: '20px',
      bgcolor: 'white',
      border: '1px solid',
      borderColor: 'divider',
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
      spacing={1}
      sx={{ pl: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
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
        label={getPlatformLabel(item.platform as Platform)}
        sx={{ fontWeight: 600, bgcolor: 'secondary.light' }}
      />

      <Chip
        size="small"
        color="primary"
        variant="outlined"
        label={getPlacementFormatLabel(item.format as PlacementFormat)}
        sx={{ fontWeight: 600 }}
      />
    </Stack>

    <Typography
      variant="body2"
      sx={{ pl: 1, fontWeight: 500 }}
    >
      {formatPostDeliverable(toPostDeliverable(item))}
    </Typography>
  </Box>
);

export const TaskDeliverablesSection = ({
  isEdit,
}: TaskDeliverablesSectionProps) => {
  const { control } = useFormContext<TaskFormType>();
  const deliverables = useWatch({
    control,
    name: 'deliverables',
  });

  const filledDeliverables =
    deliverables?.filter(item => item.platform && item.format) ?? [];

  if (!isEdit && !filledDeliverables.length) {
    return null;
  }

  return (
    <Box>
      {isEdit ? (
        <DeliverablesField fieldName="deliverables" />
      ) : (
        <Stack spacing={1.5}>
          {filledDeliverables.map((item, index) => (
            <DeliverableViewCard
              key={`${item.platform}-${item.format}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
