import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';

import { BASE_COLOR } from '@/app/index';

import LoginForm from './LoginForm';
import RegistrationCompanyForm from './RegistrationCompanyForm';
import RegistrationCreatorForm from './RegistrationCreatorForm';
import RegistrationManagerForm from './RegistrationManagerForm';

type AuthFormsProps = {
  onSuccess?: () => void;
  onRecoveryPassword?: () => void;
  onError?: (isOpen: boolean, message: string) => void;
};

type RegisterKind = 'creator' | 'company' | 'manager';

export const AuthForms = ({
  onSuccess,
  onError,
  onRecoveryPassword,
}: AuthFormsProps) => {
  const [registerKind, setRegisterKind] = useState<RegisterKind>('creator');
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box>
      {!isLogin && (
        <ButtonGroup fullWidth>
          <Button
            onClick={() => setRegisterKind('creator')}
            variant={registerKind === 'creator' ? 'contained' : 'outlined'}
          >
            Пользователь
          </Button>
          <Button
            onClick={() => setRegisterKind('company')}
            variant={registerKind === 'company' ? 'contained' : 'outlined'}
          >
            Компания
          </Button>
          <Button
            onClick={() => setRegisterKind('manager')}
            variant={registerKind === 'manager' ? 'contained' : 'outlined'}
          >
            Менеджер
          </Button>
        </ButtonGroup>
      )}

      {isLogin ? (
        <LoginForm
          onError={onError}
          onSuccess={onSuccess}
          onRecoveryPassword={onRecoveryPassword}
        />
      ) : (
        <>
          {registerKind === 'creator' && (
            <RegistrationCreatorForm
              onError={onError}
              onSuccess={onSuccess}
            />
          )}
          {registerKind === 'company' && (
            <RegistrationCompanyForm
              onError={onError}
              onSuccess={onSuccess}
            />
          )}
          {registerKind === 'manager' && (
            <RegistrationManagerForm
              onError={onError}
              onSuccess={onSuccess}
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
