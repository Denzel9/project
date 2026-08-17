import { Box, Skeleton, Stack, } from '@mui/material';
import { useState } from 'react';

import { USER_ROLE } from '@/entities';
import {
  MemberRole,
  type ProfileMember,
  useGetProfileMembersQuery,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';
import { EmptyBlock } from '@/shared';

import { AddMemberDialog } from './AddMemberDialog';
import { DeleteMemberDialog } from './DeleteMemberDialog';
import { MembersHeader } from './MembersHeader';
import { MembersList } from './MembersList';

export const SettingsMembersPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ProfileMember | null>(
    null
  );

  const isPrime = useAuthStore(state => state.isPrime);
  const role = useAuthStore(state => state.role);
  const membershipRole = useAuthStore(state => state.membershipRole);
  const canAdd =
    role === USER_ROLE.CREATOR || (role === USER_ROLE.COMPANY && isPrime);
  const canDelete = membershipRole === MemberRole.OWNER;

  const { data: members = [], isLoading, isError } =
    useGetProfileMembersQuery();

  const isEmpty = !isLoading && !isError && members.length === 0;

  return (
    <Stack
      spacing={3}
      sx={{ height: '100%' }}
    >
      <MembersHeader
        canAdd={canAdd}
        onAddClick={() => setIsAddOpen(true)}
      />

      {isLoading && (
        <Stack spacing={1}>
          {[1, 2, 3].map(item => (
            <Skeleton
              key={item}
              variant="rounded"
              height={72}
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Stack>
      )}

      {(isError || isEmpty) && (
        <Box
          sx={{
            height: '100%',
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock
            title={isError ?
              'Не удалось загрузить команду' :
              'В команде пока никого нет'} />
        </Box>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <MembersList
          members={members}
          canDelete={canDelete}
          onDelete={setMemberToDelete}
        />
      )}

      {isAddOpen && canAdd && (
        <AddMemberDialog
          open={isAddOpen}
          kind="TEAM"
          onClose={() => setIsAddOpen(false)}
        />
      )}

      <DeleteMemberDialog
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
      />
    </Stack>
  );
};

export default SettingsMembersPage;
