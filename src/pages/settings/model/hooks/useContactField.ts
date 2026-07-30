import { useFieldArray, useFormContext } from 'react-hook-form';

import type { AccountSchemaFormType } from '../schema/accountSchema';
import type { ContactType } from '@/entities';

type UseContactFieldProps = {
  setSnackbarOpen: (snackbarOpen: boolean, message: string) => void;
};

export const useContactField = ({ setSnackbarOpen }: UseContactFieldProps) => {
  const { control } = useFormContext<AccountSchemaFormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  const handleAddContact = (type: ContactType) => append({ type, value: '', label: '' });

  const handleRemoveContact = (index: number) => {
    remove(index);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen?.(false, '');
  };

  return {
    fields,
    handleAddContact,
    handleRemoveContact,
    handleCloseSnackbar,
  };
};
