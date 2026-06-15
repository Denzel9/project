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
  isScreenHeight = false,
}: PropsWithChildren<PageLayoutProps>) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        gap: 2,
        ...(isScreenHeight && {
          height: '100%',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }),
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
          ...(isScreenHeight && { flexShrink: 0 }),
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
                fontWeight: 500,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '1.25rem', md: '2.125rem' },
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
            justifyContent: 'flex-end',
            width: { xs: '60%', md: '100%' },
          }}
        >
          <CurrentUser />

          <IconButton onClick={() => navigate(ROUTES.PROFILE)}>
            <PersonOutlined sx={{ width: 28, height: 28 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          height: '100%',
          ...(isScreenHeight && {
            minHeight: 0,
            overflow: 'hidden',
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
