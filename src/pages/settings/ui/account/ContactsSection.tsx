import { Delete } from '@mui/icons-material';
import {
  Stack,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { CONTACT_LABELS, ContactType } from '@/entities/user';
import { FormBlock, PhoneInput } from '@/shared';
import { RHFInput } from '@/shared/ui/rhf';

import { useContactField } from '../../model/hooks/useContactField';

import type { Snackbar } from '../../model/types';

type ContactsSectionProps = {
  isOpenAddContacts: boolean;
  setSnackbar: (snackbar: Snackbar) => void;
  setIsOpenAddContacts: (isOpenAddContacts: boolean) => void;
};

export const ContactsSection = ({
  setSnackbar,
  isOpenAddContacts,
  setIsOpenAddContacts,
}: ContactsSectionProps) => {
  const { control, setValue } = useFormContext();

  const { fields, handleAddContact, handleRemoveContact } = useContactField({
    setSnackbar,
  });

  const { contacts } = useWatch({ control });

  const handleCloseAddContacts = () => {
    setIsOpenAddContacts(!isOpenAddContacts);
    setValue('contacts', []);
  };

  useEffect(() => {
    if (contacts?.length) {
      setIsOpenAddContacts(true);
    }
  }, [contacts, setIsOpenAddContacts]);

  return (
    <>
      <FormBlock
        isSingleColumn
        title={
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: isOpenAddContacts ? 4 : 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              Дополнительные контакты
            </Typography>

            <Button
              size="small"
              sx={{ width: 'fit-content' }}
              onClick={handleCloseAddContacts}
            >
              {isOpenAddContacts ? 'Закрыть' : 'Добавить контакты'}
            </Button>
          </Stack>
        }
      >
        {isOpenAddContacts &&
          fields?.map((field, index) => {
            return (
              <Stack
                spacing={2}
                direction="row"
                sx={{ alignItems: 'start' }}
                key={field.value + index.toString()}
              >
                {field.type === ContactType.PHONE ? (
                  <Controller
                    control={control}
                    name={`contacts.${index}.value`}
                    render={({ field: f }) => (
                      <PhoneInput
                        {...f}
                        sx={{ width: '40%' }}
                        label={CONTACT_LABELS[field.type]}
                      />
                    )}
                  />
                ) : (
                  <RHFInput
                    control={control}
                    name={`contacts.${index}.value`}
                    props={{
                      sx: { width: '40%' },
                      label: CONTACT_LABELS[field.type],
                      helperText:
                        field.type !== ContactType.WEBSITE
                          ? 'Только никнейм, без ссылки'
                          : undefined,
                    }}
                  />
                )}

                <RHFInput
                  control={control}
                  name={`contacts.${index}.label`}
                  props={{
                    label: 'Описание',
                    sx: { width: '60%' },
                  }}
                />

                <Box>
                  <IconButton onClick={() => handleRemoveContact(index)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Stack>
            );
          })}
      </FormBlock>

      {isOpenAddContacts && (
        <TextField
          select
          label="Добавить контакт"
          sx={{ mt: fields.length ? 4 : 0, width: '30%' }}
        >
          {Object.entries(CONTACT_LABELS).map(([key, value]) => (
            <MenuItem
              key={key}
              value={key}
              onClick={() => handleAddContact(key as ContactType)}
            >
              {value}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
};
