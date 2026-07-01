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

import type { ChatPeer } from '@/entities/chat';

type ChatHeaderProps = {
  peer?: ChatPeer;
  headerTime?: string;
  isMobile: boolean;
  onBackToContacts: () => void;
  onOpenSearch: () => void;
  onOpenAttachments: () => void;
  onOpenProfile: () => void;
};

export const ChatHeader = ({
  peer,
  headerTime,
  isMobile,
  onBackToContacts,
  onOpenSearch,
  onOpenAttachments,
  onOpenProfile,
}: ChatHeaderProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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

  const handleOpenProfile = () => {
    handleCloseMenu();
    onOpenProfile();
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: { xs: 2, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        flexShrink: 0,
        bgcolor: 'white',
        alignItems: 'center',
        borderRadius: { xs: '16px', md: '32px' },
        justifyContent: 'space-between',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', minWidth: 0, cursor: 'pointer' }}
        onClick={onOpenProfile}
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
          src={peer?.avatar ?? undefined}
          sx={{ width: 50, height: 50 }}
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
        direction="row"
        spacing={1}
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
          <MenuItem onClick={handleOpenProfile}>Перейти к профилю</MenuItem>

          <MenuItem onClick={handleOpenAttachments}>Вложения</MenuItem>

          <MenuItem>Запросить фото-отчет</MenuItem>

          <MenuItem>Добавить ТЗ</MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};
