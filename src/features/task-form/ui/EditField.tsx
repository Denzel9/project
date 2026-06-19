import { FormControl, FormLabel, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';

import type { PropsWithChildren } from 'react';

type EditFieldProps = {
  isDate?: boolean;
  name: string;
  label: string;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
};

export const EditField = ({
  name,
  label,
  isEdit,
  children,
  setIsEdit,
  isDate = false,
}: PropsWithChildren<EditFieldProps>) => {
  const { control } = useFormContext();

  const nameValue = useWatch({
    control,
    name,
  });

  const value = isDate
    ? format(nameValue || new Date(), 'dd.MM.yyyy HH:mm')
    : nameValue;

  return isEdit ? (
    children
  ) : (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2, fontWeight: 500, fontSize: '18px' }}>
        {label}
      </FormLabel>

      {value ? (
        <Typography variant="body1">{value}</Typography>
      ) : (
        <Typography
          onClick={() => setIsEdit(true)}
          sx={{
            color: 'info.main',
            fontWeight: 500,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            ':hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Добавить
        </Typography>
      )}
    </FormControl>
  );
};
