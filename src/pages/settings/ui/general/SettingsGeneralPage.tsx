import { Button, Stack, Typography } from '@mui/material';

import { SettingsRow } from '../SettingsRow';

export const SettingsGeneralPage = () => {
  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        General
      </Typography>

      <SettingsRow
        title="Название компании"
        description="Название компании"
        action={
          <Button
            variant="outlined"
            color="primary"
          >
            Название компании
          </Button>
        }
      />

      <SettingsRow
        title="Название компании"
        description="Название компании"
        action={
          <Button
            variant="outlined"
            color="primary"
          >
            Название компании
          </Button>
        }
      />
    </Stack>
  );
};

export default SettingsGeneralPage;
