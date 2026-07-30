import { Stack, Typography } from '@mui/material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type FavoritesPrintHeaderProps = {
  total: number
  title?: string
}

export const FavoritesPrintHeader = ({
  total,
  title = 'Избранное',
}: FavoritesPrintHeaderProps) => (
  <Stack
    className="print-only"
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
      {title}
    </Typography>

    <Typography variant="body2">Таблица</Typography>

    <Typography
      variant="caption"
      color="text.secondary"
    >
      Сформировано:{' '}
      {format(new Date(), 'dd MMM yyyy HH:mm', { locale: ru })} · Записей:{' '}
      {total}
    </Typography>
  </Stack>
)
