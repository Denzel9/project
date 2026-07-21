import { ArrowBack, MoreVert, Search } from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { USER_ROLE, type ChatPeer } from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';

type ChatHeaderProps = {
  peer?: ChatPeer;
  isMobile: boolean;
  headerTime?: string;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onBackToContacts: () => void;
  onOpenAttachments: () => void;
};

export const ChatHeader = ({
  peer,
  headerTime,
  isMobile,
  onOpenSearch,
  onOpenProfile,
  onBackToContacts,
  onOpenAttachments,
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

  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        width: '100%',
        flexShrink: 0,
        bgcolor: 'white',
        p: { xs: 2, md: 4 },
        border: '1px solid',
        alignItems: 'center',
        borderColor: 'divider',
        justifyContent: 'space-between',
        borderRadius: { xs: '16px', md: '32px' },
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        onClick={onOpenProfile}
        sx={{ alignItems: 'center', minWidth: 0, cursor: 'pointer' }}
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

        <Avatar
          alt={peer?.displayName}
          sx={{ width: 50, height: 50 }}
          src={peer?.avatar ?? undefined}
        />
        <Stack
          direction="column"
          sx={{ minWidth: 0 }}
        >
          <Typography
            variant="body1"
            noWrap
            sx={{
              transition: 'color 0.2s ease-in-out',
              ':hover': { color: 'primary.main' },
            }}
          >
            {peer?.displayName}
          </Typography>

          {headerTime && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {headerTime}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack
        spacing={1}
        direction="row"
        sx={{ alignItems: 'center', flexShrink: 0 }}
      >
        <IconButton onClick={onOpenSearch}>
          <Search />
        </IconButton>

        <IconButton onClick={handleOpenMenu}>
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={`${ROUTES.PROFILE}?userId=${peer?.id}`}
          >
            Перейти к профилю
          </MenuItem>

          <MenuItem onClick={handleOpenAttachments}>Вложения</MenuItem>

          {role === USER_ROLE.COMPANY && (
            <>
              <MenuItem>Запросить фото-отчет</MenuItem>
              <MenuItem>Добавить ТЗ</MenuItem>
            </>
          )}

          {role === USER_ROLE.CREATOR && (
            <MenuItem>Добавить фото-отчет</MenuItem>
          )}
        </Menu>
      </Stack>
    </Stack>
  );
};
