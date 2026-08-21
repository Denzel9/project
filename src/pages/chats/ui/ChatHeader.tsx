import { ArrowBack, Close, MoreVert, Search, StickyNote2 } from '@mui/icons-material';
import {
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { USER_ROLE, type ChatMessage, type ChatPeer } from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { ChatMessageSearchAutocomplete } from '@/widgets/chat';

type ChatHeaderProps = {
  peer?: ChatPeer;
  isNotes?: boolean;
  isMobile: boolean;
  headerTime?: string;
  hasActiveTasks?: boolean;
  hasPeerTasks?: boolean;
  hasTaskTzMessages?: boolean;
  isSearchOpen: boolean;
  conversationId: string | null;
  onToggleSearch: () => void;
  onSelectSearchMessage: (message: ChatMessage) => void;
  onOpenTaskTz?: () => void;
  onOpenProfile: () => void;
  onBackToContacts: () => void;
  onOpenAttachments: () => void;
  onOpenPhotoReport?: () => void;
  onOpenAddTask?: () => void;
  onOpenTasks?: () => void;
};

export const ChatHeader = ({
  peer,
  isNotes = false,
  headerTime,
  isMobile,
  hasActiveTasks = false,
  hasPeerTasks = false,
  hasTaskTzMessages = false,
  isSearchOpen,
  conversationId,
  onToggleSearch,
  onSelectSearchMessage,
  onOpenTaskTz,
  onOpenProfile,
  onBackToContacts,
  onOpenAttachments,
  onOpenPhotoReport,
  onOpenAddTask,
  onOpenTasks,
}: ChatHeaderProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { role } = useAuthStore();

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenAttachments = () => {
    handleCloseMenu();
    onOpenAttachments();
  };

  const handleOpenTaskTz = () => {
    handleCloseMenu();
    onOpenTaskTz?.();
  };

  const handleOpenPhotoReport = () => {
    handleCloseMenu();
    onOpenPhotoReport?.();
  };

  const handleOpenAddTask = () => {
    handleCloseMenu();
    onOpenAddTask?.();
  };

  const handleOpenTasks = () => {
    handleCloseMenu();
    onOpenTasks?.();
  };

  const displayName = isNotes ? 'Заметки' : peer?.displayName;

  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        p: 2,
        width: '100%',
        flexShrink: 0,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderRadius: '24px',
        alignItems: 'center',
        borderColor: 'divider',
        justifyContent: 'space-between',
        borderTop: theme => ({ xs: 'none', md: `1px solid ${theme.palette.divider}` }),
        borderTopRightRadius: { xs: 0, md: '24px' },
        borderTopLeftRadius: { xs: 0, md: '24px' },
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        onClick={isNotes ? undefined : onOpenProfile}
        sx={{
          minWidth: 0,
          flex: 1,
          alignItems: 'center',
          cursor: isNotes ? 'default' : 'pointer',
          display: isSearchOpen && isMobile ? 'none' : 'flex',
        }}
      >
        {isMobile && (
          <IconButton
            size="small"
            onClick={event => {
              event.stopPropagation();
              onBackToContacts();
            }}
          >
            <ArrowBack />
          </IconButton>
        )}

        {isNotes ? (
          <Avatar
            alt={displayName}
            sx={{
              width: 50,
              height: 50,
              bgcolor: 'primary.main',
              color: 'common.white',
            }}
          >
            <StickyNote2 />
          </Avatar>
        ) : (
          <Avatar
            alt={displayName}
            sx={{ width: 50, height: 50 }}
            src={peer?.avatar ?? undefined}
          />
        )}
        <Stack
          direction="column"
          sx={{ minWidth: 0 }}
        >
          <Typography
            variant="body1"
            noWrap
            sx={{
              transition: 'color 0.2s ease-in-out',
              ...(!isNotes && {
                ':hover': { color: 'primary.main' },
              }),
            }}
          >
            {displayName}
          </Typography>

          {headerTime && (
            <Typography
              variant="body2"
              color={headerTime === 'в сети' ? 'success.main' : 'text.secondary'}
            >
              {headerTime}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack
        spacing={1}
        direction="row"
        sx={{
          alignItems: 'center',
          flexShrink: 0,
          flex: isSearchOpen && isMobile ? 1 : undefined,
          minWidth: 0,
        }}
      >
        {isSearchOpen && (
          <ChatMessageSearchAutocomplete
            autoFocus
            conversationId={conversationId}
            onSelect={onSelectSearchMessage}
            sx={{
              width: { xs: '100%', md: 240 },
              minWidth: 0,
              flex: { xs: 1, md: 'none' },
            }}
          />
        )}

        <IconButton onClick={onToggleSearch}>
          {isSearchOpen ? <Close /> : <Search />}
        </IconButton>

        {!isSearchOpen && (
          <IconButton onClick={handleOpenMenu}>
            <MoreVert />
          </IconButton>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          {!isNotes && (
            <>
              <MenuItem
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                href={`${ROUTES.PROFILE}?userId=${peer?.id}`}
              >
                Перейти к профилю
              </MenuItem>
              <Divider />
            </>
          )}

          <MenuItem onClick={handleOpenAttachments}>Вложения</MenuItem>

          {!isNotes && hasPeerTasks && (
            <>
              <Divider />
              <MenuItem onClick={handleOpenTasks}>Задачи</MenuItem>
            </>
          )}

          {hasTaskTzMessages && (
            <>
              <Divider />
              <MenuItem onClick={handleOpenTaskTz}>Технические задания</MenuItem>
            </>
          )}

          {role === USER_ROLE.COMPANY && (
            <>
              <Divider />
              <MenuItem onClick={handleOpenAddTask}>Добавить ТЗ</MenuItem>
            </>
          )}

          {role === USER_ROLE.CREATOR && hasActiveTasks && (
            <>
              <Divider />
              <MenuItem onClick={handleOpenPhotoReport}>
                Прикрепить результаты работы
              </MenuItem>
            </>
          )}
        </Menu>
      </Stack>
    </Stack>
  );
};
