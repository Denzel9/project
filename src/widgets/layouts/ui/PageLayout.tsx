import { HelpOutlineTwoTone } from '@mui/icons-material';
import { Box, IconButton, Stack, useMediaQuery } from '@mui/material';
import { type PropsWithChildren, useState } from 'react';

import { CurrentUser } from '@/features/current-user';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import { HelpDialog } from './HelpDialog';
import { NotificationsMenu } from './NotificationsMenu';
import { PageFooter } from './PageFooter';

import type { PageLayoutProps } from '../model/types';

export const PageLayout = ({
  sx = {},
  children,
  withFooter = true,
  isScreenHeight = false,
  printHide = false,
}: PropsWithChildren<PageLayoutProps>) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <Box
      className="page-layout"
      sx={{
        pr: { xs: 0, md: 2 },
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        gap: 1,
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
          p: { xs: 2, md: 4 },
          alignItems: 'center',
          borderColor: 'divider',
          justifyContent: 'space-between',
          borderTopLeftRadius: { xs: '16px', md: '32px' },
          borderBottomLeftRadius: { xs: '16px', md: '32px' },
          borderBottomRightRadius: { xs: '16px', md: '32px' },
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
            aria-label="Помощь"
            onClick={() => setIsHelpOpen(true)}
          >
            <HelpOutlineTwoTone />
          </IconButton>

          <HelpDialog
            open={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
          />

          <Box sx={{ mr: '8px !important' }}>
            <NotificationsMenu />
          </Box>

          <CurrentUser isButton={isMobile} />
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
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
