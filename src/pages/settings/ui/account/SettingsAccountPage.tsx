import { Divider, Stack } from '@mui/material';

import { useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';

import { AccountActionsSection } from './AccountActionsSection';
import { AccountSecuritySection } from './AccountSecuritySection';
import { ProfileSection } from './ProfileSection';
import { SupportAccessSection } from './SupportAccessSection';

export const SettingsAccountPage = () => {
  const { id } = useAuthStore();

  const { data: user } = useGetUserByIdQuery(id);
  return (
    <Stack
      spacing={4}
      divider={<Divider />}
    >
      <ProfileSection user={user?.data} />
      <AccountSecuritySection />
      <SupportAccessSection />
      <AccountActionsSection />
    </Stack>
  );
};

export default SettingsAccountPage;
