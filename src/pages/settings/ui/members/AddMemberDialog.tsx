import { yupResolver } from '@hookform/resolvers/yup';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  type InviteKind,
  MemberRole,
  useAddInviteMutation,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';
import { RHFInput } from '@/shared/ui/rhf';

import {
  addMemberSchema,
  defaultAddMemberValues,
  type AddMemberFormType,
} from '../../model/schema/membersSchema';

type AddMemberDialogProps = {
  open: boolean;
  onClose: () => void;
  /** TEAM — менеджер в команду; CROSS — связанный COMPANY/CREATOR */
  kind?: InviteKind;
};

export const AddMemberDialog = ({
  open,
  onClose,
  kind = 'TEAM',
}: AddMemberDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const isCross = kind === 'CROSS';

  const { mutateAsync: addMember, isPending } = useAddInviteMutation();
  const { id } = useAuthStore();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultAddMemberValues,
    resolver: yupResolver(addMemberSchema),
  });

  const { handleSubmit, control, reset } = methods;

  const handleClose = () => {
    reset(defaultAddMemberValues);
    setError(null);
    onClose();
  };

  const onSubmit = async (data: AddMemberFormType) => {
    await addMember({
      email: data.email,
      userId: id || '',
      role: MemberRole.ADMIN,
      kind,
    })
      .then(() => {
        setError(null);
        handleClose();
      })
      .catch(err => {
        if (isAxiosError(err)) {
          setError(err.response?.data.message);
        }
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          minWidth: 400,
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': { bgcolor: 'secondary.light' },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3 }}
        >
          {isCross ? 'Добавить профиль' : 'Добавить менеджера'}
        </Typography>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <RHFInput
                name="email"
                regex={/^[a-zA-Z0-9@._+-]*$/}
                control={control}
                props={{
                  label: 'Почта',
                  fullWidth: true,
                  type: 'email',
                  helperText: 'Только латинские буквы, цифры и символы @._+-',
                }}
              />

              {!isCross && (
                <RHFInput
                  name="role"
                  control={control}
                  props={{
                    label: 'Роль',
                    fullWidth: true,
                    select: true,
                    sx: { mt: 1 },
                  }}
                >
                  <MenuItem value={MemberRole.ADMIN}>Менеджер</MenuItem>
                </RHFInput>
              )}

              <Stack
                spacing={1}
                sx={{ p: 4, bgcolor: 'secondary.main', borderRadius: 4 }}
              >
                <Typography
                  variant="body2"
                  color="info"
                >
                  {isCross
                    ? 'Связанный профиль компании или исполнителя получит доступ к этому рабочему пространству.'
                    : 'Менеджер получает полный доступ к рабочему пространству профиля.'}
                </Typography>
              </Stack>

              {error && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="error"
                  >
                    {error}
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 8, justifyContent: 'flex-end' }}
              >
                <Button
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Отменить
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPending}
                >
                  Добавить
                </Button>
              </Stack>
            </Stack>
          </form>
        </FormProvider>
      </Box>
    </Dialog>
  );
};
