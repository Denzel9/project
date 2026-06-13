import { PersonOutlined } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';

import { CurrentUser } from '@/features/current-user';
import { ROUTES } from '@/shared/config/routes';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import type { PageLayoutProps } from '../model/types';

export const PageLayout = ({
  sx = {},
  children,
  title = undefined,
  isFullHeight = false,
}: PropsWithChildren<PageLayoutProps>) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: isFullHeight ? 'calc(100vh - 16px)' : 'auto',
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 2 }}
        sx={{
          p: { xs: 2, md: 4 },
          bgcolor: 'white',
          alignItems: 'center',
          borderTopLeftRadius: { xs: '16px', md: '32px' },
          borderBottomLeftRadius: { xs: '16px', md: '32px' },
          borderBottomRightRadius: { xs: '16px', md: '32px' },
          justifyContent: 'space-between',
        }}
      >
        <Stack
          spacing={{ xs: 1, md: 2 }}
          direction="row"
          sx={{
            alignItems: 'center',
            zIndex: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          <SideBarButton />

          {title && (
            <Typography
              noWrap
              sx={{
                fontSize: { xs: '1.25rem', md: '2.125rem' },
                fontWeight: 500,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 1, md: 2 }}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            justifyContent: 'flex-end',
          }}
        >
          <CurrentUser />

          <IconButton onClick={() => navigate(ROUTES.PROFILE)}>
            <PersonOutlined sx={{ width: 28, height: 28 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, height: '100%' }}>{children}</Box>
    </Box>
  );
};

export default PageLayout;
