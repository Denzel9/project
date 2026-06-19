import { Add, Close, Delete } from '@mui/icons-material';
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

import { CONTACT_LABELS, ContactType } from '@/entities';
import { FormBlock, PhoneInput, RHFInput } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { useContactField } from '../../model/hooks/useContactField';

import type { AccountSchemaFormType } from '../../model/schema/accountSchema';

type ContactsSectionProps = {
  isOpenAddContacts: boolean;
  setIsOpenAddContacts: (isOpenAddContacts: boolean) => void;
};

export const ContactsSection = ({
  isOpenAddContacts,
  setIsOpenAddContacts,
}: ContactsSectionProps) => {
  const { control, setValue } = useFormContext<AccountSchemaFormType>();

  const { setSnackbarOpen } = useSnackbarStore();

  const { fields, handleAddContact, handleRemoveContact } = useContactField({
    setSnackbarOpen,
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
        gap={4}
        isSingleColumn
        title={
          <Stack
            direction="row"
            sx={{
              width: '100%',
              alignItems: 'center',
              mb: isOpenAddContacts ? 4 : 0,
              justifyContent: 'space-between',
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
              sx={{
                display: { xs: 'none', md: 'block' },
                px: 2,
              }}
              onClick={handleCloseAddContacts}
            >
              {isOpenAddContacts ? 'Закрыть' : 'Добавить контакты'}
            </Button>

            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <IconButton onClick={handleCloseAddContacts}>
                {isOpenAddContacts ? <Close /> : <Add />}
              </IconButton>
            </Box>
          </Stack>
        }
      >
        {isOpenAddContacts &&
          fields?.map((field, index) => {
            return (
              <Stack
                spacing={2}
                key={field.id}
                direction="row"
                sx={{ alignItems: 'start' }}
              >
                <Stack
                  spacing={2}
                  direction={{ xs: 'column', md: 'row' }}
                  sx={{ alignItems: 'start', width: '100%' }}
                >
                  {field.type === ContactType.PHONE ? (
                    <Controller
                      control={control}
                      name={`contacts.${index}.value`}
                      render={({ field: f }) => (
                        <PhoneInput
                          {...f}
                          sx={{ width: { xs: '100%', md: '40%' } }}
                          label={CONTACT_LABELS[field.type]}
                        />
                      )}
                    />
                  ) : (
                    <RHFInput
                      control={control}
                      name={`contacts.${index}.value`}
                      props={{
                        sx: { width: { xs: '100%', md: '40%' } },
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
                      sx: { width: { xs: '100%', md: '60%' } },
                    }}
                  />
                </Stack>

                <Box>
                  <IconButton
                    sx={{ mt: 1 }}
                    onClick={() => handleRemoveContact(index)}
                  >
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
          sx={{ mt: fields.length ? 4 : 0, width: { xs: '100%', md: '30%' } }}
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
