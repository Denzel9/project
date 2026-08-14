import { Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { ROUTES } from '@/shared';

import { WHITE_COLOR } from '../model/constants';

const linkSx = {
  color: 'primary.main',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  '&:hover': { textDecoration: 'underline' },
} as const;

type AuthLegalNoticeProps = {
  actionLabel: string;
};

export const AuthLegalNotice = ({ actionLabel }: AuthLegalNoticeProps) => (
  <Typography
    variant="body2"
    sx={{ mt: 2, textAlign: 'center', color: WHITE_COLOR }}
  >
    Нажимая «{actionLabel}», вы принимаете{' '}
    <Link
      component={RouterLink}
      to={ROUTES.USER_AGREEMENT}
      target="_blank"
      rel="noopener noreferrer"
      sx={linkSx}
    >
      пользовательское соглашение
    </Link>{' '}
    и{' '}
    <Link
      component={RouterLink}
      to={ROUTES.PRIVACY_POLICY}
      target="_blank"
      rel="noopener noreferrer"
      sx={linkSx}
    >
      политику конфиденциальности
    </Link>
  </Typography>
);
