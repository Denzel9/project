import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useNavigate } from 'react-router';

import { useAcceptInviteMutation } from '@/entities/workspace-member';
import { ROUTES } from '@/shared';

export const InvitePage = () => {
  const [isError, setIsError] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();

  const { mutateAsync: acceptInvite, isPending } = useAcceptInviteMutation();

  useEffect(() => {
    if (token) {
      acceptInvite(token)
        .then(res => {
          if (!res?.data) {
            setIsError(true);
          }
          // navigate(ROUTES.INDEX, { replace: true });
        })
        .catch(() => {
          setIsError(true);
        });
    }
  }, [acceptInvite, token]);

  return (
    <Box
      sx={{
        padding: 10,
        height: '100vh',
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: 'white',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography
          variant="h6"
          sx={{ position: 'absolute', top: 32, left: 32 }}
        >
          LOGO
        </Typography>

        {!isError && (
          <Typography
            sx={{ mt: 4, fontWeight: 500, opacity: 0.5 }}
            variant="h5"
          >
            Добавляем Вас в команду!
          </Typography>
        )}

        {isError && (
          <Box
            sx={{
              mt: 4,
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">Что то пошло не так...</Typography>
            <Typography variant="h6">Пожалуйста, попробуйте снова.</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.INDEX, { replace: true })}
            >
              На главную
            </Button>
          </Box>
        )}
      </Box>

      <Backdrop
        open={isPending}
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </Box>
  );
};

export default InvitePage;
