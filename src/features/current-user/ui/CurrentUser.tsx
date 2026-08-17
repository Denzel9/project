import { Add, ManageAccounts } from '@mui/icons-material';
import {
  Box,
  TextField,
  MenuItem,
  Skeleton,
  Menu,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  getProfileSwitchLines,
  useGetProfilesQuery,
  type WorkspaceMember,
} from '@/entities';
import { useAuthStore, useSwitchActiveProfile } from '@/features';
import { ROUTES } from '@/shared/config/routes';
import { useSnackbarStore } from '@/widgets';

import { useCurrentUserStore } from '../model/store';

const ProfileSwitchLabel = ({
  item,
  emphasize = false,
}: {
  item: WorkspaceMember;
  emphasize?: boolean;
}) => {
  const { primary, secondary } = getProfileSwitchLines(item);

  return (
    <Stack
      spacing={0}
      sx={{ textAlign: 'left', overflow: 'hidden' }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{ fontWeight: emphasize ? 600 : undefined }}
      >
        {primary}
      </Typography>
      {secondary ? (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {secondary}
        </Typography>
      ) : null}
    </Stack>
  );
};

export const CurrentUser = ({ isButton = false }: { isButton?: boolean }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { setSnackbarOpen } = useSnackbarStore();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const { data, isLoading } = useGetProfilesQuery();

  const { switchActiveProfile, isPending } = useSwitchActiveProfile();

  const { id, role } = useAuthStore();

  const { currentUser, setCurrentUser } = useCurrentUserStore();

  const navigate = useNavigate();

  const profiles = useMemo(() => data?.data ?? [], [data?.data]);

  const activeProfile = useMemo(
    () => profiles.find(item => item.userId === id),
    [profiles, id]
  );

  useEffect(() => {
    if (data?.data) {
      const tryCurrentUser = data.data.find(item => item.userId === id);
      setCurrentUser(tryCurrentUser?.userId || '');
    }
  }, [data, id, setCurrentUser]);

  const handleChangeUser = async (value: string) => {
    if (value === 'newUser') {
      navigate(
        role === 'MANAGER' ? ROUTES.SETTINGS_PROFILES : ROUTES.SETTINGS_MEMBERS
      );
      return;
    }

    const switched = await switchActiveProfile(value);

    if (!switched) return;

    setAnchorEl(null);
    setSnackbarOpen?.(true, 'Профиль успешно переключен');
  };

  if (isLoading || isPending) {
    return (
      <Skeleton
        height={56}
        variant="rounded"
        sx={{ width: '30%' }}
      />
    );
  }

  if (isButton) {
    return (
      <>
        <IconButton onClick={handleClick} color={'primary'}>
          <ManageAccounts />
        </IconButton>

        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
        >
          {profiles.map(item => (
            <MenuItem
              sx={{
                minWidth: 200,
              }}
              key={item.id}
              disabled={item.userId === id}
              onClick={() => void handleChangeUser(item.userId || '')}
            >
              <ProfileSwitchLabel item={item} />
            </MenuItem>
          ))}

          <MenuItem
            value="newUser"
            sx={{ color: 'primary.main' }}
            onClick={() => void handleChangeUser('newUser')}
          >
            <Add
              sx={{ mr: 1 }}
              color="primary"
            />
            Добавить
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Box sx={{ minWidth: 300 }}>
      <TextField
        select
        size="small"
        value={currentUser}
        onChange={e => void handleChangeUser(e.target.value)}
        sx={{
          width: '100%',
          borderRadius: '16px',
          backgroundColor: 'background.paper',
        }}
        slotProps={{
          select: {
            renderValue: () =>
              activeProfile ? (
                <ProfileSwitchLabel
                  item={activeProfile}
                  emphasize
                />
              ) : (
                'Профиль'
              ),
          },
        }}
      >
        {profiles.map(item => (
          <MenuItem
            key={item.id}
            disabled={item.userId === id}
            value={item.userId}
          >
            <ProfileSwitchLabel item={item} />
          </MenuItem>
        ))}
        <MenuItem
          value="newUser"
          sx={{ color: 'primary.main' }}
        >
          <Add
            sx={{ mr: 1 }}
            color="primary"
          />
          Добавить
        </MenuItem>
      </TextField>
    </Box>
  );
};
