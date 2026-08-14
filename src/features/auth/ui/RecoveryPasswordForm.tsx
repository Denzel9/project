import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

import { useRecoveryPasswordMutation } from '../model';
import { WHITE_COLOR, WHITE_INPUT_VARIANT } from '../model/constants';

type RecoveryPasswordFormProps = {
  onSuccess: () => void;
  onBackToLogin: () => void;
  onError: (isOpen: boolean, message: string) => void;
};

const RecoveryPasswordForm = ({
  onSuccess,
  onBackToLogin,
  onError,
}: RecoveryPasswordFormProps) => {
  const [email, setEmail] = useState('');

  const { mutateAsync: recoveryPassword } = useRecoveryPasswordMutation();

  const onRecoveryPassword = async () => {
    try {
      await recoveryPassword({ email });

      onSuccess();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        onError?.(true, e.response?.data.message);
      }
    }
  };
  return (
    <Box>
      <Typography
        variant="body1"
        sx={{ color: WHITE_COLOR, }}
      >
        Отправим ссылку для восстановления пароля на вашу почту
      </Typography>

      {/* TODO: add validation */}
      <TextField
        fullWidth
        label="Email"
        value={email}
        sx={{ my: 2, ...WHITE_INPUT_VARIANT }}
        onChange={e => setEmail(e.target.value)}
      />

      <Stack
        direction="row"
        spacing={2}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={onBackToLogin}
        >
          Назад
        </Button>

        <Button
          disabled={!email}
          variant="contained"
          color="primary"
          onClick={onRecoveryPassword}
          sx={{ '&:disabled': { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.25)' } }}
        >
          Отправить
        </Button>
      </Stack>
    </Box>
  );
};

export default RecoveryPasswordForm;
