import { PersonOutlined } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';

import { CurrentUser } from '@/features/current-user';
import { ROUTES } from '@/shared/config/routes';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import type { PageLayoutProps } from '../model/types';

export const PageLayout = ({
  children,
  title = undefined,
  sx = {},
}: PropsWithChildren<PageLayoutProps>) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 0, position: 'relative', ...sx }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          p: 4,
          bgcolor: 'white',
          alignItems: 'center',
          borderTopLeftRadius: '32px',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          spacing={2}
          direction="row"
          sx={{ alignItems: 'center', zIndex: 2 }}
        >
          <SideBarButton />

          {title && <Typography variant="h4">{title}</Typography>}
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <CurrentUser />

          <IconButton onClick={() => navigate(ROUTES.PROFILE)}>
            <PersonOutlined sx={{ width: 28, height: 28 }} />
          </IconButton>
        </Stack>
      </Stack>

      {children}
    </Box>
  );
};

export default PageLayout;
