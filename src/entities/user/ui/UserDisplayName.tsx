import { Email, Verified } from '@mui/icons-material';
import {
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';

import { getUserName } from '../model/utils';

import type { User } from '../model/types';

export type UserDisplayNameVariant = 'h6' | 'subtitle1' | 'body2';

const BADGE_ICON_SIZE: Record<UserDisplayNameVariant, number> = {
  h6: 20,
  body2: 16,
  subtitle1: 18,
};

const SKELETON_HEIGHT: Record<UserDisplayNameVariant, number> = {
  h6: 28,
  body2: 20,
  subtitle1: 24,
};

export type UserDisplayNameProps = {
  name?: string;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  withBadges?: boolean;
  user?: Partial<User> | null;
  variant?: UserDisplayNameVariant;
};

export const UserDisplayName = ({
  sx,
  user,
  name,
  variant = 'h6',
  isLoading = false,
  withBadges = true,
}: UserDisplayNameProps) => {
  const displayName = (name ?? getUserName(user))?.trim();
  const shouldShowBadges = Boolean(displayName) && Boolean(user) && withBadges;
  const badgeIconSize = BADGE_ICON_SIZE[variant];

  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        width="100%"
        height={SKELETON_HEIGHT[variant]}
      />
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: 'center', minWidth: 0, ...sx }}
    >
      <Typography
        variant={variant}
      >
        {displayName ? displayName : 'Не назначено'}
      </Typography>

      {shouldShowBadges && (
        <>
          <Tooltip
            title={
              user?.isVerified
                ? 'Проверенный пользователь'
                : 'Не проверенный пользователь'
            }
          >
            <Verified
              sx={{ fontSize: badgeIconSize, flexShrink: 0 }}
              color={user?.isVerified ? 'primary' : 'error'}
            />
          </Tooltip>

          <Tooltip
            title={
              user?.isEmailConfirmed
                ? 'Подтверждённая почта'
                : 'Не подтверждённая почта'
            }
          >
            <Email
              sx={{ fontSize: badgeIconSize, flexShrink: 0 }}
              color={user?.isEmailConfirmed ? 'primary' : 'error'}
            />
          </Tooltip>
        </>
      )}
    </Stack>
  );
};
