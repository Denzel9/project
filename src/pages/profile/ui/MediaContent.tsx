import { Box, Stack, ButtonGroup, Button } from '@mui/material';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/shared';
import { ACTION_BUTTONS_KEYS, ApplicationItem, DeleteDialog } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';

export const MediaContent = ({
  mediaTabValue,
  setMediaTabValue,
}: MediaContentProps) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <ButtonGroup size="small">
          <Button
            onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ACTIVE)}
            color={
              mediaTabValue === MEDIA_TAB_VALUES.ACTIVE ? 'primary' : 'info'
            }
          >
            Активные
          </Button>
          <Button
            onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ARCHIVED)}
            color={
              mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED ? 'primary' : 'info'
            }
          >
            Архивные
          </Button>
        </ButtonGroup>

        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
        >
          Добавить
        </Button>
      </Stack>

      {mediaTabValue === MEDIA_TAB_VALUES.ACTIVE && (
        <Stack
          direction="column"
          spacing={2}
        >
          {[1, 2, 3, 4].map(application => (
            <ApplicationItem
              isMyApplication
              key={application}
              item={application}
              permissions={[
                ACTION_BUTTONS_KEYS.EDIT,
                ACTION_BUTTONS_KEYS.DELETE,
                ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
                ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
              ]}
            />
          ))}
        </Stack>
      )}

      {mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED && (
        <Stack
          direction="column"
          spacing={2}
        >
          {[1].map(application => (
            <ApplicationItem
              key={application}
              item={application}
              permissions={[
                ACTION_BUTTONS_KEYS.EDIT,
                ACTION_BUTTONS_KEYS.DELETE,
              ]}
              isMyApplication
            />
          ))}
        </Stack>
      )}

      <DeleteDialog />
    </Box>
  );
};
