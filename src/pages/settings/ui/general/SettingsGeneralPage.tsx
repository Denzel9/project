import { Button, Stack, Typography } from '@mui/material';

import { SettingsRow } from '../SettingsRow';

export const SettingsGeneralPage = () => {
  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Общие
      </Typography>

      <SettingsRow
        title="Почта"
        description="Подтвердить почту, чтобы получить полный доступ к сервису"
        action={
          <Button
            size="small"
            variant="outlined"
            color="primary"
          >
            Подтвердить
          </Button>
        }
      />

      <SettingsRow
        title="Верификация"
        description="Верифицировать аккаунт"
        action={
          <Button
            size="small"
            variant="outlined"
            color="primary"
          >
            Верифицировать
          </Button>
        }
      />
    </Stack>
  );
};

export default SettingsGeneralPage;
