import { Stack, Switch, Typography } from '@mui/material';
import { useState } from 'react';

import { SettingsRow } from '../SettingsRow';

export const SettingsNotificationPage = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Безопасность аккаунта
      </Typography>

      <SettingsRow
        title="Уведомления"
        description="Уведомления о новых сообщениях"
        action={
          <Switch
            checked={isNotificationsEnabled}
            onChange={(_, checked) => setIsNotificationsEnabled(checked)}
          />
        }
      />

      <SettingsRow
        title="Уведомления"
        description="Уведомления о новых сообщениях"
        action={
          <Switch
            checked={isNotificationsEnabled}
            onChange={(_, checked) => setIsNotificationsEnabled(checked)}
          />
        }
      />

      <SettingsRow
        title="Уведомления"
        description="Уведомления о новых сообщениях"
        action={
          <Switch
            checked={isNotificationsEnabled}
            onChange={(_, checked) => setIsNotificationsEnabled(checked)}
          />
        }
      />
    </Stack>
  );
};

export default SettingsNotificationPage;
