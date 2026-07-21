import { ArrowOutwardOutlined } from '@mui/icons-material';
import { Box, Skeleton, Stack, Typography } from '@mui/material';

import { CARD_CONFIG, type DashboardCardProps } from '../model/types';
import { getTasksLabel } from '../model/utils';

export const DashboardCard = ({
  label,
  count,
  variant,
  isLoading = false,
  onClick,
}: DashboardCardProps) => {
  const { icon: Icon, accentColor } = CARD_CONFIG[variant];
  const isEmpty = !isLoading && count === 0;

  return (
    <Box
      type="button"
      component="button"
      onClick={onClick}
      sx={{
        gap: 1.5,
        width: '100%',
        bgcolor: 'white',
        display: 'flex',
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid',
        position: 'relative',
        borderRadius: '24px',
        alignItems: 'center',
        flexDirection: 'row',
        fontFamily: 'inherit',
        p: { xs: 1.5, md: 2 },
        borderColor: 'divider',
        transition: 'all .3s ease',
        '&:hover': {
          borderColor: `${accentColor}.main`,
        },
      }}
    >
      <Stack
        spacing={1}
        sx={{ flex: 1, minWidth: 0, pl: 0.5 }}
      >
        <Typography
          variant="caption"
          color="info"
          sx={{
            fontWeight: 500,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </Typography>

        {isLoading ? (
          <Skeleton
            variant="rounded"
            width={56}
            height={28}
            sx={{ borderRadius: '8px' }}
          />
        ) : (
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: 'baseline' }}
          >
            <Box
              className="dashboard-card-icon"
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                // display: { xs: 'none', md: 'flex' },
                display: 'flex',
                color: `info.main`,
                borderRadius: '12px',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `secondary.main`,
                transition: 'transform 0.25s ease',
              }}
            >
              <Icon sx={{ fontSize: 22, color: `${accentColor}.main` }} />
            </Box>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'baseline' }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: isEmpty ? 'text.disabled' : 'text.primary',
                }}
              >
                {count}
              </Typography>

              <Typography
                variant="caption"
                color={isEmpty ? 'disabled' : 'info'}
              >
                {getTasksLabel(count)}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>

      <ArrowOutwardOutlined
        sx={{
          fontSize: 18,
          color: 'text.secondary',
          display: { xs: 'none', md: 'block' },
        }}
      />
    </Box>
  );
};
