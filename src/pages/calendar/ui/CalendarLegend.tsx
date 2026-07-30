import { Box, Stack, Typography } from '@mui/material';

const LegendDot = ({ color }: { color: string }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      bgcolor: color,
      flexShrink: 0,
    }}
  />
);

const LegendItem = ({
  color,
  label,
  secondColor,
}: {
  color: string;
  label: string;
  secondColor?: string;
}) => (
  <Stack
    direction="row"
    spacing={0.75}
    sx={{ alignItems: 'center' }}
  >
    <Stack
      direction="row"
      spacing={0.35}
      sx={{ alignItems: 'center', minWidth: secondColor ? 18 : 8 }}
    >
      <LegendDot color={color} />
      {secondColor && <LegendDot color={secondColor} />}
    </Stack>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ lineHeight: 1.2 }}
    >
      {label}
    </Typography>
  </Stack>
);

export const CalendarLegend = () => (
  <Box
    sx={{
      mt: 1.5,
      pt: 1.5,
      px: 0.5,
      borderTop: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        mb: 1,
        fontWeight: 600,
        color: 'text.secondary',
      }}
    >
      Обозначения
    </Typography>

    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ flexWrap: 'wrap', rowGap: 1 }}
    >
      <LegendItem
        color="error.main"
        label="Просроченный дедлайн"
      />
      <LegendItem
        color="primary.main"
        label="События сегодня"
      />
      <LegendItem
        color="info.main"
        label="Будущие события"
      />
      <LegendItem
        color="text.disabled"
        label="Прошедшие события"
      />
      <LegendItem
        color="info.main"
        secondColor="text.disabled"
        label="Дедлайн и создание в один день"
      />
    </Stack>
  </Box>
);
