import { Box } from '@mui/material';
import { useSearchParams } from 'react-router';

import { usePostByIdQuery } from '@/entities/post';
import { ApplicationForm } from '@/features/application-form';
import { PageLayout } from '@/widgets';

export const ManageApplicationPage = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');

  const { data: post, isLoading } = usePostByIdQuery(postId);

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
        <ApplicationForm
          data={post}
          isEdit={Boolean(postId)}
          isLoading={Boolean(postId) && isLoading}
        />
      </Box>
    </PageLayout>
  );
};

export default ManageApplicationPage;
