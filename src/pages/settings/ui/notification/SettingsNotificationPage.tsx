import { Stack, Typography } from '@mui/material';

import { SettingsRow } from '../SettingsRow';

export const SettingsNotificationPage = () => {
  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Уведомления
      </Typography>

      <SettingsRow
        title="In-app уведомления"
        description="Показываются в колокольчике в шапке и приходят в реальном времени, пока вы в системе."
      />

      <SettingsRow
        title="Email-уведомления"
        description="Письма о новых откликах, задачах, сообщениях в чате и изменениях доступа отправляются автоматически на email аккаунта."
      />

      <SettingsRow
        title="Приглашения в команду"
        description="Для приглашений используется отдельное письмо со ссылкой; in-app уведомление появится, если у приглашённого уже есть аккаунт."
      />
    </Stack>
  );
};

export default SettingsNotificationPage;
