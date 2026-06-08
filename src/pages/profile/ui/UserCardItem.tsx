import { Skeleton, Stack, type TextFieldProps } from '@mui/material';
import { type ComponentType, type ReactNode } from 'react';

import { EditTextField } from './EditTextField';

type UserCardItemProps = {
  isMe: boolean;
  name: string;
  icon: ReactNode;
  isEdit: boolean;
  isLoading: boolean;
  placeholder: string;
  InputField?: ComponentType<TextFieldProps>;
};

export const UserCardItem = ({
  isMe,
  icon,
  name,
  isEdit,
  isLoading,
  InputField,
  placeholder,
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
      {!isEdit && icon}

      <EditTextField
        name={name}
        isMe={isMe}
        isEdit={isEdit}
        InputField={InputField}
        placeholder={placeholder}
      />
    </Stack>
  );
};
