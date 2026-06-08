import { Box, Typography, Stack } from '@mui/material';
import { useState } from 'react';

import { type Contact } from '@/entities/user';

import { useProfileStore } from '../model/store';
import { MEDIA_TAB_VALUES } from '../model/types';

import { Contacts } from './Contacts';
import { EditTextField } from './EditTextField';
import { MediaContent } from './MediaContent';

type ContentProps = {
  contacts?: Contact[];
  isLoading: boolean;
  tabValue: number;
};

export const Content = ({ tabValue, contacts }: ContentProps) => {
  const { isEdit, isMe } = useProfileStore();

  const [mediaTabValue, setMediaTabValue] = useState(MEDIA_TAB_VALUES.ACTIVE);

  return (
    <Box sx={{ width: '100%' }}>
      {tabValue === 0 && (
        <MediaContent
          mediaTabValue={mediaTabValue}
          setMediaTabValue={setMediaTabValue}
        />
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 4 }}>
          <EditTextField
            isMultiline
            isMe={isMe}
            name="aboutMe"
            isEdit={isEdit}
            placeholder="Добавить о себе"
            maxLength={1000}
          />

          <Stack
            direction="row"
            spacing={10}
            sx={{ mt: 4 }}
          >
            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={10}
            sx={{ mt: 4 }}
          >
            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>

            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                Рост
              </Typography>
              <Typography variant="body1">180 см</Typography>
            </Stack>
          </Stack>
        </Box>
      )}

      {tabValue === 2 && <Contacts contacts={contacts} />}
    </Box>
  );
};
