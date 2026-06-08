import { Delete } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type ChangeEvent } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { CONTACT_LABELS, ContactType, type Contact } from '@/entities/user';
import { RHFInput } from '@/shared/ui/rhf';

import { getMaskedPhone, getContactIcon } from '../model/utils/helpers';

import type { ProfileSchemaType } from '../model/schema/schema';

export const Contacts = ({ contacts }: { contacts: Contact[] }) => {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray<ProfileSchemaType>({
    control,
    name: 'contacts',
  });

  const handleAddContact = (
    value: string,
    label: string,
    type: ContactType
  ) => {
    if (!fields.find(field => field.type === type)) {
      append({ label, type, value });
    }
  };

  const handleRemoveContact = (index: number) => {
    remove(index);
  };

  const handleChangeContact = ({
    key,
    value,
    id,
  }: {
    key: string;
    value: string;
    id: string;
  }) => {
    setValue(`contacts.${id}.${key}`, value);
  };

  return (
    <Box>
      <Stack
        direction="column"
        spacing={2}
        sx={{ mt: 4 }}
      >
        {contacts?.map(field => {
          const value =
            field.type === ContactType.PHONE
              ? getMaskedPhone(field.value)
              : field.value;

          return (
            <Stack
              key={field.value}
              direction="row"
              spacing={2}
            >
              {getContactIcon(field.type as ContactType)}
              <Typography variant="body1">{value}</Typography>
            </Stack>
          );
        })}
      </Stack>

      <Stack
        direction="column"
        spacing={2}
        sx={{ mt: 4 }}
      >
        {fields?.map((field, index) => {
          return (
            <Stack
              key={field.value}
              direction="row"
              spacing={2}
            >
              <RHFInput
                name={`contacts.${field.type}.value`}
                control={control}
                props={{
                  label: CONTACT_LABELS[field.type as ContactType],
                  onChange: (e: ChangeEvent<HTMLInputElement>) =>
                    handleChangeContact({
                      key: 'value',
                      value: e.target.value,
                      id: field.value,
                    }),
                }}
              />

              <TextField
                label="Описание"
                value={field.label}
                onChange={e =>
                  handleChangeContact({
                    key: 'label',
                    value: e.target.value,
                    id: field.value,
                  })
                }
              />

              <IconButton onClick={() => handleRemoveContact(index)}>
                <Delete />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>

      <TextField
        select
        label="Добавить контакт"
        sx={{ mt: 4, width: '30%' }}
      >
        {Object.entries(CONTACT_LABELS).map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => handleAddContact('', '', key as ContactType)}
            value={key}
          >
            {value}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};
