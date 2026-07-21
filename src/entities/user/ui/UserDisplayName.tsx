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

export type UserDisplayNameProps = {
  user?: Partial<User> | null;
  name?: string;
  isLoading?: boolean;
  variant?: 'h6' | 'body2';
  sx?: SxProps<Theme>;
};

export const UserDisplayName = ({
  sx,
  user,
  name,
  variant = 'h6',
  isLoading = false,
}: UserDisplayNameProps) => {
  const displayName = (name ?? getUserName(user))?.trim();
  const shouldShowBadges = Boolean(displayName) && Boolean(user);

  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        width="100%"
        height={24}
      />
    );
  }

  if (!displayName) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: 'center', minWidth: 0, ...sx }}
    >
      <Typography variant={variant}>{displayName}</Typography>

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
              sx={{ fontSize: 20, flexShrink: 0 }}
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
              sx={{ fontSize: 20, flexShrink: 0 }}
              color={user?.isEmailConfirmed ? 'primary' : 'error'}
            />
          </Tooltip>
        </>
      )}
    </Stack>
  );
};
