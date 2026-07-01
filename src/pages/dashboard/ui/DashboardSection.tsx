import { Box, Chip, Link, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import type { SxProps, Theme } from '@mui/material';

type DashboardSectionProps = {
  title: string;
  action?: ReactNode | (() => ReactNode);
  actionLabel?: string;
  actionTo?: string;
  isLoading?: boolean;
  emptyText?: string;
  isEmpty?: boolean;
  skeletonCount?: number;
  sx?: SxProps<Theme>;
  count?: number;
  children?: ReactNode;
};

const renderSectionAction = ({
  action,
  actionLabel,
  actionTo,
}: Pick<DashboardSectionProps, 'action' | 'actionLabel' | 'actionTo'>) => {
  if (action) {
    return typeof action === 'function' ? action() : action;
  }

  if (actionLabel && actionTo) {
    return (
      <Link
        component={RouterLink}
        to={actionTo}
        underline="hover"
        sx={{ fontSize: 14, fontWeight: 500, flexShrink: 0 }}
      >
        {actionLabel}
      </Link>
    );
  }

  return null;
};

export const DashboardSection = ({
  title,
  action,
  actionLabel,
  actionTo,
  isLoading = false,
  emptyText,
  isEmpty = false,
  skeletonCount = 3,
  sx,
  count,
  children,
}: DashboardSectionProps) => {
  const sectionAction = renderSectionAction({ action, actionLabel, actionTo });

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        display: 'flex',
        bgcolor: 'white',
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
        >
          <Typography variant="h6">{title}</Typography>
          {count && <Chip label={count} />}
        </Stack>

        {sectionAction && (
          <Box
            sx={{
              flex: { md: 1 },
              display: 'flex',
              justifyContent: { md: 'flex-end' },
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            {sectionAction}
          </Box>
        )}
      </Stack>

      {isLoading && (
        <Stack spacing={1.5}>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={72}
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Stack>
      )}

      {!isLoading && isEmpty && emptyText && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 2 }}
        >
          {emptyText}
        </Typography>
      )}

      {!isLoading && !isEmpty && children}
    </Box>
  );
};
