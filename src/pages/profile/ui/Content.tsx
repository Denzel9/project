import { Box } from '@mui/material';

import { type User } from '@/entities/user';

import { MEDIA_TAB_VALUES } from '../model/types';

import { AboutMe } from './AboutMe';
import { Contacts } from './Contacts';
import { MediaContent } from './MediaContent';

type ContentProps = {
  user?: User;
  tabValue: number;
  isLoading: boolean;
  mediaTabValue: MEDIA_TAB_VALUES;
};

export const Content = ({ tabValue, user, mediaTabValue }: ContentProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      {tabValue === 0 && (
        <MediaContent
          userId={user?.id}
          mediaTabValue={mediaTabValue}
        />
      )}

      {tabValue === 1 && (
        <AboutMe
          person={user?.person}
          aboutMe={user?.aboutMe || ''}
        />
      )}

      {tabValue === 2 && <Contacts contacts={user?.contacts || []} />}
    </Box>
  );
};
