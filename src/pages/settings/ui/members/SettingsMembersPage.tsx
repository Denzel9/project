import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import {
  type ProfileMember,
  useGetProfileMembersQuery,
} from '@/entities/workspace-member';
import { USER_ROLE } from '@/entities';
import { useAuthStore } from '@/features/auth';

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
  const canAdd =
    role === USER_ROLE.CREATOR || (role === USER_ROLE.COMPANY && isPrime);

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '24px',
              fontWeight: 500,
            }}
          >
            {isError ? (
              <>Не удалось загрузить команду</>
            ) : (
              <>
                В команде пока никого нет. <br /> Добавьте первого менеджера.
              </>
            )}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <MembersList
          members={members}
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
