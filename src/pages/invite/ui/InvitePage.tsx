import {
  Box,
  Button,
  CircularProgress,
  Stack,
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
          navigate(ROUTES.INDEX, { replace: true });
        })
        .catch(() => {
          setIsError(true);
        });
    } else {
      setTimeout(() => {
        setIsError(true);
      }, 0);
    }
  }, [acceptInvite, navigate, token]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
      }}
    >
      <Stack direction='column' sx={{ position: 'absolute', top: 32, left: 32 }}>
        <img src='/Primary.png' alt="NIKSSENSES" />
        {!isError && (
          <Typography
            sx={{ mt: 2, fontWeight: 500, opacity: 0.5 }}
            variant='subtitle1'
          >
            Добавляем Вас в команду!
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >

        {isPending && <CircularProgress
          size={40}
          color="primary"
        />}

        {isError && (
          <Stack
            direction='column'
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography variant='subtitle1'>Что то пошло не так...</Typography>
            <Typography variant='body1'>Пожалуйста, попробуйте снова.</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.INDEX, { replace: true })}
            >
              На главную
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default InvitePage;
