import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

import { useRecoveryPasswordMutation } from '../model';

const RecoveryPasswordForm = ({
  onSuccess,
  onBackToLogin,
}: {
  onSuccess: () => void;
  onBackToLogin: () => void;
}) => {
  const [email, setEmail] = useState('');

  const { mutateAsync: recoveryPassword } = useRecoveryPasswordMutation();

  const onRecoveryPassword = async () => {
    try {
      await recoveryPassword({ email });

      onSuccess();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e);
      }
    }
  };
  return (
    <Box>
      <Typography variant="body1">
        Мы отправим вам ссылку для восстановления пароля на вашу почту
      </Typography>

      <TextField
        fullWidth
        sx={{ my: 2 }}
        label="Email"
        value={email}
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
        >
          Отправить
        </Button>
      </Stack>
    </Box>
  );
};

export default RecoveryPasswordForm;
