
import { Stack, Typography, type StackProps, } from '@mui/material'

import {
  getActionActorParts,
  type ActionActorFields,
} from '@/shared/lib/formatActionActorLabel'

type ActionActorCaptionProps = {
  fallback?: string
  withKind?: boolean
  icon?: React.ReactNode
  spacing?: StackProps['spacing']
  actor?: ActionActorFields | null
  direction?: StackProps['direction']
}

/** kind (Менеджер/Владелец) и имя отдельными строками */
export const ActionActorCaption = ({
  actor,
  icon,
  fallback,
  spacing = 1,
  withKind = true,
  direction = 'column',
}: ActionActorCaptionProps) => {
  const parts = getActionActorParts(actor, fallback)
  if (!parts) return null

  return (
    <Stack
      direction={direction}
      spacing={spacing}
      sx={{ alignItems: 'center' }}
    >
      {icon}
      {withKind && parts.kindLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {parts.kindLabel}
        </Typography>
      )}

      {parts.name && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {parts.name}
        </Typography>
      )}
    </Stack>
  )
}
