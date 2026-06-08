import { Stack, Switch, Typography } from '@mui/material';
import { useState } from 'react';

import { SettingsRow } from './SettingsRow';

export const SupportAccessSection = () => {
  const [isSupportAccessEnabled, setIsSupportAccessEnabled] = useState(true);

  return (
    <Stack spacing={3}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Support Access
      </Typography>

      <SettingsRow
        title="Support access"
        description="You have granted us to access to your account for support purposes until Aug 31, 2023, 9:40 PM."
        action={
          <Switch
            checked={isSupportAccessEnabled}
            onChange={(_, checked) => setIsSupportAccessEnabled(checked)}
          />
        }
      />
    </Stack>
  );
};
