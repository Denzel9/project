import { Box } from '@mui/material';
import { useState } from 'react';

import { type User } from '@/entities/user';

import { MEDIA_TAB_VALUES } from '../model/types';

import { AboutMe } from './AboutMe';
import { Contacts } from './Contacts';
import { MediaContent } from './MediaContent';

type ContentProps = {
  isLoading: boolean;
  tabValue: number;
  user: User;
};

export const Content = ({ tabValue, user }: ContentProps) => {
  const [mediaTabValue, setMediaTabValue] = useState(MEDIA_TAB_VALUES.ACTIVE);

  return (
    <Box sx={{ width: '100%' }}>
      {tabValue === 0 && (
        <MediaContent
          userId={user?.id}
          mediaTabValue={mediaTabValue}
          setMediaTabValue={setMediaTabValue}
        />
      )}

      {tabValue === 1 && (
        <AboutMe
          person={user?.person}
          aboutMe={user?.aboutMe}
        />
      )}

      {tabValue === 2 && <Contacts contacts={user?.contacts} />}
    </Box>
  );
};
