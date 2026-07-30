import { Link, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';

import { getYandexMapsUrl } from '@/shared/lib/maps/openYandexMaps';

type UserCardItemProps = {
  value: string;
  icon?: ReactNode;
  isLoading: boolean;
  type: 'text' | 'email' | 'phone' | 'location';
};

export const UserCardItem = ({
  icon,
  value,
  isLoading,
  type = 'text',
}: UserCardItemProps) => {
  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        width="100%"
        height={24}
      />
    );
  }

  const href =
    type === 'email'
      ? `mailto:${value}`
      : type === 'phone'
        ? `tel:${value}`
        : type === 'location'
          ? getYandexMapsUrl(value)
          : undefined;

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{ alignItems: 'center' }}
    >
      {icon && icon}

      <Typography
        component={href ? Link : 'span'}
        href={href}
        target={type === 'location' ? '_blank' : undefined}
        rel={type === 'location' ? 'noopener noreferrer' : undefined}
        sx={{
          color: 'inherit',
          textDecoration: type === 'location' ? 'underline' : 'none',
          textUnderlineOffset: 2,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};
