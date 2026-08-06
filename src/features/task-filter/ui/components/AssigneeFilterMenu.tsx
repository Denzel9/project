import {
  Check,
  PersonOutlined,
} from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  MemberRole,
  useGetProfileMembersQuery,
  useGetProfilesQuery,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';

import { useMyTaskFilterStore } from '../../model/store';

type AssigneeFilterMenuProps = {
  isCompany: boolean;
};

export const useIsManagerAccount = () => {
  const { data: profilesData } = useGetProfilesQuery();

  return useMemo(
    () =>
      (profilesData?.data ?? []).some(profile => profile.role === 'MANAGER'),
    [profilesData?.data]
  );
};

export const AssigneeFilterMenu = ({ isCompany }: AssigneeFilterMenuProps) => {
  const membershipRole = useAuthStore(state => state.membershipRole);
  const {
    onlyMyTasks,
    assigneeAccountId,
    setOnlyMyTasks,
    setAssigneeAccountId,
  } = useMyTaskFilterStore();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const isManagerAccount = useIsManagerAccount();

  const canFilterByAssignee =
    isCompany &&
    (membershipRole === MemberRole.OWNER ||
      membershipRole === MemberRole.ADMIN);

  const showManagerMenu = canFilterByAssignee && !isManagerAccount;
  const showOnlyMyTasksMenu = isCompany && isManagerAccount;

  const didApplyManagerDefault = useRef(false);

  useEffect(() => {
    if (!isCompany) return;

    if (isManagerAccount) {
      if (!didApplyManagerDefault.current) {
        didApplyManagerDefault.current = true;
        setOnlyMyTasks(true);
      }
      return;
    }

    if (didApplyManagerDefault.current) {
      didApplyManagerDefault.current = false;
      setOnlyMyTasks(false);
    }
  }, [isCompany, isManagerAccount, setOnlyMyTasks]);

  const { data: profileMembers, isLoading: isManagersLoading } =
    useGetProfileMembersQuery(showManagerMenu && Boolean(menuAnchor));

  const managerOptions = useMemo(
    () =>
      (profileMembers ?? [])
        .filter(member => member.membershipRole === MemberRole.ADMIN)
        .map(member => ({
          id: member.accountId,
          label: member.displayName || member.email || 'Менеджер',
        })),
    [profileMembers]
  );

  if (!showManagerMenu && !showOnlyMyTasksMenu) return null;

  // Для менеджера «только мои» — дефолт и иконка primary
  const isActive = showOnlyMyTasksMenu
    ? onlyMyTasks
    : assigneeAccountId !== 'all';

  const closeMenu = () => setMenuAnchor(null);

  const tooltipTitle = showOnlyMyTasksMenu
    ? onlyMyTasks
      ? 'Показаны только мои задачи'
      : 'Фильтр: мои задачи'
    : assigneeAccountId === 'all'
      ? 'Фильтр по менеджеру'
      : `Менеджер: ${managerOptions.find(option => option.id === assigneeAccountId)
        ?.label ?? 'выбран'
      }`;

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          size="small"
          aria-pressed={isActive}
          aria-label="Фильтр по ответственному"
          color={isActive ? 'primary' : 'default'}
          onClick={event => setMenuAnchor(event.currentTarget)}
        >
          <PersonOutlined />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {showOnlyMyTasksMenu && (
          <MenuItem
            onClick={() => {
              setOnlyMyTasks(!onlyMyTasks);
              closeMenu();
            }}
          >
            <ListItemIcon>
              {onlyMyTasks ? <Check fontSize="small" /> : null}
            </ListItemIcon>
            <ListItemText>Только мои задачи</ListItemText>
          </MenuItem>
        )}

        {showManagerMenu && (
          <MenuItem
            selected={assigneeAccountId === 'all'}
            onClick={() => {
              setAssigneeAccountId('all');
              closeMenu();
            }}
          >
            <ListItemIcon>
              {assigneeAccountId === 'all' ? (
                <Check fontSize="small" />
              ) : null}
            </ListItemIcon>
            <ListItemText>Все менеджеры</ListItemText>
          </MenuItem>
        )}

        {showManagerMenu && isManagersLoading && (
          <MenuItem disabled>
            <ListItemIcon>
              <CircularProgress size={16} />
            </ListItemIcon>
            <ListItemText>Загрузка…</ListItemText>
          </MenuItem>
        )}

        {showManagerMenu &&
          !isManagersLoading &&
          managerOptions.map(option => (
            <MenuItem
              key={option.id}
              selected={assigneeAccountId === option.id}
              onClick={() => {
                setAssigneeAccountId(option.id);
                closeMenu();
              }}
            >
              <ListItemIcon>
                {assigneeAccountId === option.id ? (
                  <Check fontSize="small" />
                ) : null}
              </ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          ))}

        {showManagerMenu &&
          !isManagersLoading &&
          managerOptions.length === 0 && (
            <MenuItem disabled>
              <ListItemText>Нет менеджеров</ListItemText>
            </MenuItem>
          )}
      </Menu>
    </>
  );
};
