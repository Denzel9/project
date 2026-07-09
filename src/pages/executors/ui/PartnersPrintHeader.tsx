import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type PartnersPrintHeaderProps = {
  pageTitle: string;
  tabLabel: string;
  total: number;
};

export const PartnersPrintHeader = ({
  pageTitle,
  tabLabel,
  total,
}: PartnersPrintHeaderProps) => (
  <Stack
    className="partners-print-only"
    spacing={0.5}
    sx={{
      display: 'none',
      '@media print': {
        display: 'flex',
        mb: 2,
        pb: 2,
        borderBottom: '1px solid #ccc',
      },
    }}
  >
    <Typography
      variant="h6"
      sx={{ fontWeight: 600 }}
    >
      {pageTitle}
    </Typography>

    <Typography variant="body2">{tabLabel}</Typography>

    <Typography
      variant="caption"
      color="text.secondary"
    >
      Сформировано:{' '}
      {format(new Date(), 'dd MMM yyyy HH:mm', { locale: ru })} · Записей:{' '}
      {total}
    </Typography>
  </Stack>
);
