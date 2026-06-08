import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import {
  type WorkspaceMember,
  useGetProfilesQuery,
} from '@/entities/workspace-member';

import { AddMemberDialog } from './AddMemberDialog';
import { DeleteMemberDialog } from './DeleteMemberDialog';
import { MembersHeader } from './MembersHeader';
import { MembersList } from './MembersList';

export const SettingsMembersPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(
    null
  );

  const { data, isLoading, isError } = useGetProfilesQuery();

  return (
    <Stack
      spacing={3}
      sx={{ height: '100%' }}
    >
      <MembersHeader onAddClick={() => setIsAddOpen(true)} />

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

      {(isError || !data?.data?.length) && (
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
            Участников пока нет. <br /> Добавьте первого участника.
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && (
        <MembersList
          members={data?.data ?? []}
          onDelete={setMemberToDelete}
        />
      )}

      <AddMemberDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <DeleteMemberDialog
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
      />
    </Stack>
  );
};

export default SettingsMembersPage;
