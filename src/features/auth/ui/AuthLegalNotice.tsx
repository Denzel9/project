import { Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { ROUTES } from '@/shared';

const linkSx = {
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': { color: 'primary.main' },
} as const;

type AuthLegalNoticeProps = {
  actionLabel: string;
};

export const AuthLegalNotice = ({ actionLabel }: AuthLegalNoticeProps) => (
  <Typography
    variant="caption"
    color="info"
    sx={{ mt: 2, textAlign: 'center' }}
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
