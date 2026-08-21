import { yupResolver } from '@hookform/resolvers/yup';
import { Button, MenuItem, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  type InviteKind,
  MemberRole,
  useAddInviteMutation,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';
import { AppDialog, appDialogActionsSx, RHFInput } from '@/shared';

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
    <AppDialog
      open={open}
      onClose={handleClose}
      title={isCross ? 'Добавить профиль' : 'Добавить менеджера'}
      minWidth={400}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            spacing={2}
            sx={{ mt: 3 }}
          >
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
              <Typography
                variant="body2"
                color="error"
              >
                {error}
              </Typography>
            )}

            <Stack
              direction="row"
              sx={appDialogActionsSx}
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
    </AppDialog>
  );
};
