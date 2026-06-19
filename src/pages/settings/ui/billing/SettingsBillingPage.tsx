import { Button, Stack, Typography } from '@mui/material';

import { SettingsRow } from '../SettingsRow';

export const SettingsBillingPage = () => {
  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Платежи
      </Typography>

      <SettingsRow
        title="Платежи"
        description="Платежи за использование сервиса"
        action={
          <Button
            variant="outlined"
            color="primary"
          >
            Платежи
          </Button>
        }
      />

      <SettingsRow
        title="Платежи"
        description="Платежи за использование сервиса"
        action={
          <Button
            variant="outlined"
            color="primary"
          >
            Платежи
          </Button>
        }
      />
    </Stack>
  );
};

export default SettingsBillingPage;
