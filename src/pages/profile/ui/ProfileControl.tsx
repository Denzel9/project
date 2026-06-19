import { Add } from '@mui/icons-material';
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
} from '@mui/material';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/shared';

import { MEDIA_TAB_VALUES } from '../model/types';

import type { SyntheticEvent } from 'react';

type ProfileControlProps = {
  id?: string;
  tabValue: number;
  mediaTabValue: MEDIA_TAB_VALUES;
  setMediaTabValue: (value: MEDIA_TAB_VALUES) => void;
  handleTabChange: (event: SyntheticEvent, newValue: number) => void;
};

export const ProfileControl = ({
  id,
  tabValue,
  mediaTabValue,
  handleTabChange,
  setMediaTabValue,
}: ProfileControlProps) => {
  const navigate = useNavigate();

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
        borderRadius: '32px',
        mt: { xs: 2, md: 20 },
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
          <Tab label="Медиа" />
          <Tab label="Обо мне" />
          <Tab label="Контакты" />
        </Tabs>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {id ? (
            <Button
              size="small"
              sx={{ px: 2 }}
              onClick={() => navigate(`${ROUTES.CHAT}?recipientId=${id}`)}
            >
              Написать сообщение
            </Button>
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

      {!id && tabValue === 0 && (
        <Stack
          direction="row"
          sx={{
            width: '100%',
            bgcolor: 'white',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
              onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
            >
              Добавить
            </Button>

            <IconButton
              size="small"
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
            >
              <Add />
            </IconButton>
          </Box>

          <Typography
            color="info"
            variant="subtitle1"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            Доступно: 5
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
