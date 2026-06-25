import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router';

import { USER_ROLE, usePostByIdQuery } from '@/entities';
import { ApplicationForm, useAuthStore, UserPostForm } from '@/features';
import { PageLayout } from '@/widgets';

export const ManageApplicationPage = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const isEdit = Boolean(postId);

  const { data: post, isLoading } = usePostByIdQuery(postId);

  const { role } = useAuthStore();

  const isCompany = role === USER_ROLE.COMPANY;
  const isCreator = role === USER_ROLE.CREATOR;

  const showLoader = isEdit && isLoading;

  return (
    <PageLayout>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          width: '100%',
          bgcolor: 'white',
          borderRadius: { xs: '24px', md: '32px' },
        }}
      >
        {showLoader ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isCompany && (
              <ApplicationForm
                data={post}
                isEdit={isEdit}
                isLoading={false}
              />
            )}

            {isCreator && (
              <UserPostForm
                data={post}
                isEdit={isEdit}
                isLoading={false}
              />
            )}
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default ManageApplicationPage;
