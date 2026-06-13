import { Divider, Stack } from '@mui/material';

import { AccountActionsSection } from './AccountActionsSection';
import { AccountSecuritySection } from './AccountSecuritySection';
import { SupportAccessSection } from './SupportAccessSection';

export const SettingsAccountPage = () => {
  return (
    <Stack
      spacing={4}
      divider={<Divider />}
    >
      <AccountSecuritySection />
      <SupportAccessSection />
      <AccountActionsSection />
    </Stack>
  );
};

export default SettingsAccountPage;
