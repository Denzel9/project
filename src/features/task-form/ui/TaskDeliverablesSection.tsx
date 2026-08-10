import { Box, Chip, Grid, Stack, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  getPlacementFormatLabel,
  getPlatformLabel,
  PlacementFormatEnum,
  type PlacementFormat,
  type Platform,
} from '@/entities/post';
import { DeliverablesField } from '@/features/application-form/ui/components/DeliverablesField';

import type { TaskDeliverableFormItem } from '../model/deliverablesMappers';
import type { TaskFormType } from '../model/schema/schema';

type TaskDeliverablesSectionProps = {
  isEdit: boolean;
};

const formatCountLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} штука`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} штуки`;
  }

  return `${count} штук`;
};

const formatDurationLabel = (seconds: number) => {
  if (seconds < 60) return `${seconds} сек.`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (rest === 0) {
    return minutes === 1 ? '1 мин.' : `${minutes} мин.`;
  }

  return `${minutes} мин. ${rest} сек.`;
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <Stack
    spacing={0.25}
    sx={{ minWidth: 0, flex: 1 }}
  >
    <Typography
      variant="caption"
      color="info"
      sx={{ fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: 600 }}
    >
      {value}
    </Typography>
  </Stack>
);

const DeliverableViewCard = ({ item }: { item: TaskDeliverableFormItem }) => {
  const platform = item.platform as Platform;
  const format = item.format as PlacementFormat;
  const count = Number(item.count) || 1;
  const durationSec = item.durationSec?.trim()
    ? Number(item.durationSec)
    : undefined;
  const showsDuration =
    format !== PlacementFormatEnum.POST &&
    durationSec != null &&
    !Number.isNaN(durationSec);

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
        // width: 'fit-content',
        minWidth: 280,
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
        spacing={1}
        direction="row"
        sx={{ pl: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
      >
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

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.25, sm: 3 }}
        sx={{ pl: 1 }}
      >
        <MetaRow
          label="Количество"
          value={formatCountLabel(count)}
        />

        {showsDuration && (
          <MetaRow
            label="Длительность"
            value={formatDurationLabel(durationSec)}
          />
        )}
      </Stack>
    </Box>
  );
};

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
        <Grid
          container
          spacing={1}
        >
          {filledDeliverables.map((item, index) => (
            <Grid
              size={{ xs: 6 }}
              key={`${item.platform}-${item.format}-${index}`}
            >
              <DeliverableViewCard item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
