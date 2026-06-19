import { Box } from '@mui/material';
import { useSearchParams } from 'react-router';

import { USER_ROLE, usePostByIdQuery } from '@/entities';
import { ApplicationForm, useAuthStore, UserPostForm } from '@/features';
import { PageLayout } from '@/widgets';

export const ManageApplicationPage = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');

  const { data: post, isLoading } = usePostByIdQuery(postId);

  const { role } = useAuthStore();

  return (
    <PageLayout>
      <Box
        sx={{
          p: 4,
          width: '100%',
          bgcolor: 'white',
          borderRadius: '32px',
        }}
      >
        {role === USER_ROLE.COMPANY && (
          <ApplicationForm
            data={post}
            isEdit={Boolean(postId)}
            isLoading={Boolean(postId) && isLoading}
          />
        )}

        {role === USER_ROLE.CREATOR && (
          <UserPostForm
            data={post}
            isEdit={Boolean(postId)}
            isLoading={Boolean(postId) && isLoading}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default ManageApplicationPage;
