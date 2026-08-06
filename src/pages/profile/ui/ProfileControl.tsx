import { Add, MoreVert } from '@mui/icons-material';
import {
  Stack,
  Tabs,
  Tab,
  Box,
  ButtonGroup,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Menu,
} from '@mui/material';
import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';

import { useFavoriteUserIds } from '@/entities/favorite';
import { useRequireEmailConfirmed } from '@/features/auth';
import { ROUTES, ShareButton } from '@/shared';
import { UserFavoriteButton } from '@/widgets';

import { MEDIA_TAB_VALUES } from '../model/types';

type ProfileControlProps = {
  id?: string;
  shareTitle?: string;
  tabValue: number;
  isCompany: boolean;
  mediaTabValue: MEDIA_TAB_VALUES;
  setMediaTabValue: (value: MEDIA_TAB_VALUES) => void;
  handleTabChange: (event: SyntheticEvent, newValue: number) => void;
};

export const ProfileControl = ({
  id,
  shareTitle = '',
  tabValue,
  isCompany,
  mediaTabValue,
  handleTabChange,
  setMediaTabValue,
}: ProfileControlProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpenMenu = Boolean(anchorEl);

  const navigate = useNavigate();
  const { favoriteUserIds } = useFavoriteUserIds();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const handleCreatePost = () => {
    if (!requireEmailConfirmed()) return;
    navigate(ROUTES.MANAGE_APPLICATION);
  };

  return (
    <Stack
      direction="column"
      spacing={4}
      sx={{
        zIndex: 2,
        width: '100%',
        bgcolor: 'white',
        p: { xs: 3, md: 4 },
        alignItems: 'start',
        border: '1px solid',
        borderRadius: '32px',
        mt: { xs: 2, md: 20 },
        borderColor: 'divider',
        justifyContent: 'space-between',
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ width: '100%', justifyContent: 'space-between' }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
        >
          <Tab label="Объявления" />
          <Tab label={isCompany ? 'О компании' : 'Обо мне'} />
          <Tab label="Контакты" />
        </Tabs>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {id ? (
            <Stack
              direction="row"
              spacing={2}
            >
              <UserFavoriteButton
                userId={id}
                isFavorite={favoriteUserIds.has(id)}
              />

              <ShareButton
                userId={id}
                title={shareTitle}
              />

              <Box>
                <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </Box>

              <Menu
                open={isOpenMenu}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem>
                  {/* TODO: add report action */}
                  <Typography>Пожаловаться</Typography>
                </MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Button
              size="small"
              sx={{ px: 2 }}
              onClick={() => navigate(ROUTES.SETTINGS_ACCOUNT)}
            >
              Редактировать
            </Button>
          )}
        </Box>
      </Stack>

      {!id && (
        <Stack
          direction="row"
          sx={{
            width: '100%',
            bgcolor: 'white',
            alignItems: 'center',
            justifyContent: 'space-between',
            display: tabValue === 0 ? 'flex' : 'none',
          }}
        >
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <ButtonGroup sx={{ display: { xs: 'none', md: 'block' } }}>
              <Button
                size="small"
                onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ACTIVE)}
                color={
                  mediaTabValue === MEDIA_TAB_VALUES.ACTIVE ? 'primary' : 'info'
                }
              >
                Активные
              </Button>

              <Button
                size="small"
                onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ARCHIVED)}
                color={
                  mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED
                    ? 'primary'
                    : 'info'
                }
              >
                Архивные
              </Button>

              <Button
                size="small"
                onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.PRIVATE)}
                color={
                  mediaTabValue === MEDIA_TAB_VALUES.PRIVATE
                    ? 'primary'
                    : 'info'
                }
              >
                Приватные
              </Button>
            </ButtonGroup>

            <TextField
              select
              fullWidth
              size="small"
              label="Поиск"
              variant="outlined"
              value={mediaTabValue}
              sx={{ display: { xs: 'block', md: 'none' } }}
              onChange={e =>
                setMediaTabValue(e.target.value as MEDIA_TAB_VALUES)
              }
            >
              <MenuItem value={MEDIA_TAB_VALUES.ACTIVE}>Активные</MenuItem>
              <MenuItem value={MEDIA_TAB_VALUES.ARCHIVED}>Архивные</MenuItem>
            </TextField>

            <Button
              size="small"
              variant="contained"
              sx={{ display: { xs: 'none', md: 'block' } }}
              onClick={handleCreatePost}
            >
              Добавить
            </Button>

            <IconButton
              size="small"
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={handleCreatePost}
            >
              <Add />
            </IconButton>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
