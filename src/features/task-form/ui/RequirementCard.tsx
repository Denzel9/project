import { Event, PhotoCamera, Videocam } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

import type { ReactNode } from 'react';

type RequirementCardProps = {
  icon: 'photo' | 'video' | 'deadline';
  label: string;
  value?: string | null;
  placeholder: string;
  emptyReadOnlyLabel?: string;
  canEdit: boolean;
  onEdit?: () => void;
  children?: ReactNode;
  isEdit?: boolean;
};

const icons = {
  photo: PhotoCamera,
  video: Videocam,
  deadline: Event,
} as const;

export const RequirementCard = ({
  icon,
  label,
  value,
  placeholder,
  emptyReadOnlyLabel,
  canEdit,
  onEdit,
  children,
  isEdit = false,
}: RequirementCardProps) => {
  const Icon = icons[icon];

  const displayValue =
    icon === 'deadline' && value
      ? format(new Date(value), 'dd.MM.yyyy HH:mm')
      : value?.trim() || null;

  return (
    <Box
      sx={{
        p: 2,
        flex: 1,
        minWidth: 0,
        borderRadius: '16px',
        bgcolor: 'secondary.light',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: isEdit ? 'center' : 'flex-start' }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'white',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {!isEdit && (
            <Typography
              variant="caption"
              sx={{ color: 'info.main', fontWeight: 500 }}
            >
              {label}
            </Typography>
          )}

          {children ??
            (displayValue ? (
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, mt: 0.25 }}
              >
                {displayValue}
              </Typography>
            ) : !canEdit && emptyReadOnlyLabel ? (
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, mt: 0.25 }}
              >
                {emptyReadOnlyLabel}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                onClick={() => canEdit && onEdit?.()}
                sx={{
                  mt: 0.25,
                  color: 'info.main',
                  fontWeight: 500,
                  cursor: canEdit ? 'pointer' : 'default',
                  transition: 'color 0.2s',
                  ':hover': canEdit ? { color: 'primary.main' } : {},
                }}
              >
                {placeholder}
              </Typography>
            ))}
        </Box>
      </Stack>
    </Box>
  );
};
