import { HelpOutlineTwoTone, RocketLaunchOutlined } from '@mui/icons-material';
import { Box, IconButton, Stack, useMediaQuery } from '@mui/material';
import { type PropsWithChildren, useState } from 'react';
import { useNavigate } from 'react-router';

import { CurrentUser } from '@/features/current-user';
import { ROUTES, SAFE_AREA } from '@/shared';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import { HelpDialog } from './HelpDialog';
import { NotificationsMenu } from './NotificationsMenu';
import { PageFooter } from './PageFooter';

import type { PageLayoutProps } from '../model/types';

export const PageLayout = ({
  sx = {},
  children,
  withHeader = true,
  withFooter = true,
  isScreenHeight = false,
  printHide = false,
}: PropsWithChildren<PageLayoutProps>) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const navigate = useNavigate();

  return (
    <Box
      className="page-layout"
      sx={{
        pr: { xs: 0, md: 1 },
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        gap: 1,
        boxSizing: 'border-box',
        pt: SAFE_AREA.top,
        ...(isScreenHeight && {
          height: '100%',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }),
        '@media print': {
          height: 'auto',
          minHeight: 'auto',
          overflow: 'visible',
          flex: 'none',
          pt: 0,
          pb: 0,
          pl: 0,
        },
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 2 }}
        {...(printHide ? { 'data-print-hide': true } : {})}
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          p: { xs: 2, md: 2 },
          alignItems: 'center',
          borderColor: 'divider',
          justifyContent: 'space-between',
          borderTopLeftRadius: { xs: 0, md: '24px' },
          display: withHeader ? 'flex' : 'none',
          borderTopColor: { xs: 'transparent', md: 'divider' },
          borderBottomLeftRadius: { xs: '16px', md: '24px' },
          borderBottomRightRadius: { xs: '16px', md: '24px' },
          ...(isScreenHeight && { flexShrink: 0 }),
        }}
      >
        <SideBarButton />

        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center' }}
        >
          <IconButton
            aria-label="Prime-аккаунт"
            onClick={() => navigate(ROUTES.SETTINGS_BILLING)}
          >
            <RocketLaunchOutlined />
          </IconButton>

          <IconButton
            aria-label="Помощь"
            onClick={() => setIsHelpOpen(true)}
          >
            <HelpOutlineTwoTone />
          </IconButton>

          <HelpDialog
            open={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
          />

          <NotificationsMenu />

          <CurrentUser isButton={isMobile} />
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          minHeight: 500,
          flexDirection: 'column',
          ...(isScreenHeight && {
            minHeight: 0,
            overflow: 'hidden',
          }),
          '@media print': {
            height: 'auto',
            minHeight: 'auto',
            overflow: 'visible',
            flex: 'none',
          },
        }}
      >
        {children}
      </Box>

      {!isScreenHeight && withFooter && (
        <Box data-print-hide={printHide ? true : undefined}>
          <PageFooter />
        </Box>
      )}
    </Box>
  );
};

export default PageLayout;
