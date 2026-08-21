import { Tune } from '@mui/icons-material'
import { IconButton, type IconButtonProps, type SxProps, type Theme } from '@mui/material'

/** Footer actions row for mobile filter drawers */
export const mobileFilterActionsSx = {
  mt: 4,
  pb: { xs: 2, md: 0 },
} as const satisfies SxProps<Theme>

type MobileFilterOpenButtonProps = {
  active?: boolean
  onClick: () => void
  /** Override default `display: { xs: 'inline-flex', md: 'none' }` when needed */
  sx?: SxProps<Theme>
} & Pick<IconButtonProps, 'aria-label' | 'aria-pressed'>

export const MobileFilterOpenButton = ({
  active = false,
  onClick,
  sx,
  'aria-label': ariaLabel = 'Фильтры',
  'aria-pressed': ariaPressed,
}: MobileFilterOpenButtonProps) => (
  <IconButton
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    onClick={onClick}
    color={active ? 'primary' : 'default'}
    sx={[
      { display: { xs: 'inline-flex', md: 'none' } },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    <Tune />
  </IconButton>
)
