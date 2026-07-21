import { Link, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';

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

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{ alignItems: 'center' }}
    >
      {icon && icon}

      <Typography
        component={type === 'text' ? 'span' : Link}
        href={
          type === 'email'
            ? `mailto:${value}`
            : type === 'phone'
              ? `tel:${value}`
              : type === 'location'
                ? `${value}`
                : undefined
        }
        sx={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};
