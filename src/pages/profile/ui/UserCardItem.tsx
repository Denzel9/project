import { Skeleton, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';

type UserCardItemProps = {
  value: string;
  icon?: ReactNode;
  isLoading: boolean;
};

export const UserCardItem = ({ icon, value, isLoading }: UserCardItemProps) => {
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

      <Typography>{value}</Typography>
    </Stack>
  );
};
