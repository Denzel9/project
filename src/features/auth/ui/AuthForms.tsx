import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';

import { BASE_COLOR } from '@/app/index';

import LoginForm from './LoginForm';
import RegistrationCompanyForm from './RegistrationCompanyForm';
import RegistrationCreatorForm from './RegistrationCreatorForm';

type AuthFormsProps = {
  onSuccess?: () => void;
  onRecoveryPassword?: () => void;
  onError?: ({ message, isOpen }: { message: string; isOpen: boolean }) => void;
};

export const AuthForms = ({
  onSuccess,
  onError,
  onRecoveryPassword,
}: AuthFormsProps) => {
  const [isCreator, setIsCreator] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box>
      {!isLogin && (
        <ButtonGroup fullWidth>
          <Button
            onClick={() => setIsCreator(true)}
            variant={isCreator ? 'contained' : 'outlined'}
          >
            Пользователь
          </Button>
          <Button
            onClick={() => setIsCreator(false)}
            variant={isCreator ? 'outlined' : 'contained'}
          >
            Компания
          </Button>
        </ButtonGroup>
      )}

      {isLogin ? (
        <LoginForm
          onSuccess={onSuccess}
          onError={onError}
          onRecoveryPassword={onRecoveryPassword}
        />
      ) : (
        <>
          {isCreator ? (
            <RegistrationCreatorForm
              onSuccess={onSuccess}
              onError={onError}
            />
          ) : (
            <RegistrationCompanyForm
              onSuccess={onSuccess}
              onError={onError}
            />
          )}
        </>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          color="info"
          sx={{ mt: 2 }}
        >
          {isLogin ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ cursor: 'pointer', color: BASE_COLOR }}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};
