import { Close, InfoOutlined, Refresh, WifiOff } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';

type ErrorPresentation = {
  title: string;
  description: string;
  Icon: typeof WifiOff;
  canRetry: boolean;
  tone: 'connection' | 'warning' | 'info';
};

const CONNECTION_PATTERN = /соединени|connection/i;
const SEND_PATTERN = /отправ/i;

const getErrorPresentation = (message: string): ErrorPresentation => {
  if (CONNECTION_PATTERN.test(message)) {
    return {
      title: 'Нет связи с чатом',
      description:
        'Сообщения не отправятся, пока соединение не восстановится. Мы уже пробуем подключиться снова.',
      Icon: WifiOff,
      canRetry: true,
      tone: 'connection',
    };
  }

  if (SEND_PATTERN.test(message)) {
    return {
      title: 'Сообщение не отправилось',
      description: message,
      Icon: InfoOutlined,
      canRetry: true,
      tone: 'warning',
    };
  }

  return {
    title: 'Не получилось',
    description: message,
    Icon: InfoOutlined,
    canRetry: false,
    tone: 'info',
  };
};

const toneStyles = {
  connection: {
    bgcolor: 'rgba(255, 152, 0, 0.08)',
    borderColor: 'rgba(255, 152, 0, 0.24)',
    iconColor: 'warning.main',
  },
  warning: {
    bgcolor: 'rgba(244, 67, 54, 0.06)',
    borderColor: 'rgba(244, 67, 54, 0.18)',
    iconColor: 'error.main',
  },
  info: {
    bgcolor: 'info.light',
    borderColor: 'primary.light',
    iconColor: 'primary.main',
  },
} as const;

type ChatErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
};

export const ChatErrorBanner = ({
  message,
  onRetry,
  onDismiss,
}: ChatErrorBannerProps) => {
  const { title, description, Icon, canRetry, tone } =
    getErrorPresentation(message);
  const styles = toneStyles[tone];

  return (
    <Box
      sx={{
        mb: 1.5,
        p: { xs: 1.5, md: 2 },
        borderRadius: '20px',
        border: '1px solid',
        bgcolor: styles.bgcolor,
        borderColor: styles.borderColor,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'flex-start' }}
      >
        <Box
          sx={{
            mt: 0.25,
            width: 36,
            height: 36,
            display: 'flex',
            flexShrink: 0,
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'common.white',
          }}
        >
          <Icon
            sx={{ fontSize: 20, color: styles.iconColor }}
          />
        </Box>

        <Stack
          spacing={0.75}
          sx={{ flex: 1, minWidth: 0, pt: 0.25 }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.45 }}
          >
            {description}
          </Typography>

          {canRetry && onRetry && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh sx={{ fontSize: '18px !important' }} />}
              onClick={onRetry}
              sx={{
                mt: 0.5,
                width: 'fit-content',
                px: 2,
                py: 0.75,
                borderRadius: '12px',
              }}
            >
              Повторить
            </Button>
          )}
        </Stack>

        {onDismiss && (
          <IconButton
            size="small"
            aria-label="Закрыть"
            onClick={onDismiss}
            sx={{
              mt: -0.5,
              mr: -0.5,
              color: 'text.secondary',
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};
