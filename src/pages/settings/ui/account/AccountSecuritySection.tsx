import { Button, Stack, Switch, Typography } from '@mui/material';
import { useState } from 'react';

import { SettingsRow } from './SettingsRow';

// import type { User } from '@/entities/user';

export const AccountSecuritySection = () =>
  // { user }: { user: User }
  {
    const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(true);

    return (
      <Stack spacing={3}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Безопасность аккаунта
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center' }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{ minWidth: 140, flexShrink: 0 }}
          >
            Изменить email
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{ minWidth: 140, flexShrink: 0 }}
          >
            Изменить пароль
          </Button>
        </Stack>

        <SettingsRow
          title="2-Step Verification"
          description="Добавить дополнительный слой безопасности для вашего аккаунта во время входа."
          action={
            <Switch
              checked={isTwoStepEnabled}
              onChange={(_, checked) => setIsTwoStepEnabled(checked)}
            />
          }
        />
      </Stack>
    );
  };
