import { FormControl, FormLabel, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';

import type { PropsWithChildren } from 'react';

type EditFieldProps = {
  name: string;
  label?: string;
  isEdit: boolean;
  isDate?: boolean;
  canEdit?: boolean;
  fieldLabel?: string;
  setIsEdit: (isEdit: boolean) => void;
};

export const EditField = ({
  name,
  label,
  isEdit,
  children,
  setIsEdit,
  fieldLabel,
  canEdit = true,
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
      <FormLabel sx={{ mb: 2, fontWeight: 500, fontSize: '16px' }}>
        {label}
      </FormLabel>

      {value ? (
        <Typography variant="body1">{value}</Typography>
      ) : (
        <Typography
          onClick={() => canEdit && setIsEdit(true)}
          sx={{
            color: 'info.main',
            fontWeight: 500,
            fontSize: '16px',
            cursor: canEdit ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            ':hover': canEdit
              ? {
                  color: 'primary.main',
                }
              : {},
          }}
        >
          Добавить {fieldLabel ? fieldLabel : ''}
        </Typography>
      )}
    </FormControl>
  );
};
