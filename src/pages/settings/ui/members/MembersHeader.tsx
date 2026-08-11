import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { ROUTES } from '@/shared/config/routes';

type MembersHeaderProps = {
  canAdd: boolean;
  onAddClick: () => void;
};

export const MembersHeader = ({ canAdd, onAddClick }: MembersHeaderProps) => {
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Команда
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Менеджеры с доступом к этому профилю
          </Typography>
        </Stack>

        <Button
          variant="contained"
          onClick={onAddClick}
          disabled={!canAdd}
          sx={{ flexShrink: 0, px: 2 }}
        >
          Добавить менеджера
        </Button>
      </Stack>

      {!canAdd && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Чтобы добавить менеджера, подключите{' '}
          <Typography
            component={RouterLink}
            to={ROUTES.SETTINGS_BILLING}
            variant="body2"
            color="primary"
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            Prime-подписку
          </Typography>{' '}
          для профиля компании.
        </Typography>
      )}
    </Stack>
  );
};
