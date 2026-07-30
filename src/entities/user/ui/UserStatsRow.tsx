import { FavoriteBorder, WorkOutlineOutlined } from '@mui/icons-material'
import { Stack, Tooltip, Typography, type SxProps, type Theme } from '@mui/material'

type UserStatsRowProps = {
  followers?: number | null
  completedTasksCount?: number | null
  sx?: SxProps<Theme>
}

export const UserStatsRow = ({
  followers = 0,
  completedTasksCount = 0,
  sx,
}: UserStatsRowProps) => (
  <Stack
    spacing={2}
    direction="row"
    sx={[{ color: 'text.secondary' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Tooltip title="Пользователи, которые добавили этого пользователя в избранное">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center' }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
        >
          {followers ?? 0}
        </Typography>
        <FavoriteBorder fontSize="small" />
      </Stack>
    </Tooltip>

    <Tooltip title="Кол-во выполненных работ пользователем">
      <Stack
        spacing={1}
        direction="row"
        sx={{ alignItems: 'center' }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
        >
          {completedTasksCount ?? 0}
        </Typography>
        <WorkOutlineOutlined fontSize="small" />
      </Stack>
    </Tooltip>
  </Stack>
)
