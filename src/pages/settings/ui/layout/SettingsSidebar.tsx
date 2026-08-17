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
        bgcolor: 'background.paper',
        border: '1px solid',
        borderRadius: '32px',
        borderColor: 'divider',
      }}
    >
      <SettingsNavSections pathname={pathname} />
    </Box>
  );
};
