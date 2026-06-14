import { Box } from '@mui/material';
import { useLocation } from 'react-router';

import { SettingsNavSections } from './SettingsNavSections';

export const SettingsSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Box
      sx={{
        p: 4,
        minWidth: 350,
        bgcolor: 'white',
        borderRadius: '32px',
      }}
    >
      <SettingsNavSections pathname={pathname} />
    </Box>
  );
};
