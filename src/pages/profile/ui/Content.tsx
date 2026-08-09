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
    <Box sx={{ width: '100%', height: '100%' }}>
      <MediaContent
        tabValue={tabValue}
        userId={user?.id}
        mediaTabValue={mediaTabValue}
      />

      <AboutMe
        tabValue={tabValue}
        person={user?.person}
        aboutMe={user?.aboutMe || ''}
      />

      <Contacts
        tabValue={tabValue}
        contacts={user?.contacts || []}
      />
    </Box>
  );
};
