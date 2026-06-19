import { Divider, Stack } from '@mui/material';

import { AccountActionsSection } from './AccountActionsSection';
import { AccountSecuritySection } from './AccountSecuritySection';

export const SettingsAccountPage = () => {
  return (
    <Stack
      spacing={4}
      divider={<Divider />}
    >
      <AccountSecuritySection />
      <AccountActionsSection />
    </Stack>
  );
};

export default SettingsAccountPage;
