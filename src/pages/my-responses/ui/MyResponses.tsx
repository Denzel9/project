import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  canWithdrawApplication,
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from '@/entities/application';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { PageLayout } from '@/widgets';

export const MyResponses = () => {
  const { data: applications, isLoading } = useMyApplicationsQuery({
    page: 1,
    limit: 20,
  });

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();

  const navigate = useNavigate();

  return (
    <PageLayout
      title="Мои отклики"
      isFullHeight
    >
      <Box
        sx={{
          p: 4,
          mt: 2,
          gap: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          borderRadius: '32px',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !applications?.items?.length && (
          <EmptyBlock
            buttonText="На главную"
            title="У вас пока нет откликов"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        )}

        {applications?.items?.map(application => (
          <Box
            key={application.id}
            sx={{
              p: 3,
              borderRadius: '24px',
              border: theme => `1px solid ${theme.palette.secondary.main}`,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Link
                  to={`${ROUTES.POST}/${application.postId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography variant="h6">
                    {application.post?.title ?? 'Пост'}
                  </Typography>
                </Link>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ mt: 2, maxWidth: 700 }}
                >
                  {application.message}
                </Typography>
              </Box>

              <Stack
                spacing={1}
                sx={{ alignItems: 'flex-end', flexShrink: 0 }}
              >
                <Chip
                  size="small"
                  label={APPLICATION_STATUS_LABELS[application.status]}
                  color={
                    application.status === 'ACCEPTED'
                      ? 'success'
                      : application.status === 'REJECTED'
                        ? 'error'
                        : application.status === 'WITHDRAWN'
                          ? 'default'
                          : 'primary'
                  }
                />

                {canWithdrawApplication(application.status) && (
                  <Button
                    size="small"
                    color="error"
                    disabled={isWithdrawing}
                    onClick={() => withdrawApplication(application.id)}
                  >
                    Отозвать
                  </Button>
                )}

                {application.post?.ownerId && (
                  <Button
                    size="small"
                    component={Link}
                    to={`${ROUTES.CHAT}?recipientId=${application.post.ownerId}`}
                  >
                    В чат
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </PageLayout>
  );
};

export default MyResponses;
