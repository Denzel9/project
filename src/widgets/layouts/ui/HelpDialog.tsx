import {
  Close,
  EmailOutlined,
  ForumOutlined,
  MenuBookOutlined,
  OpenInNew,
  Telegram,
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import { SUPPORT_CHANNELS } from '../model/support';

import type { SupportChannel } from '../model/support';
import type { ReactNode } from 'react';

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CHANNEL_ICONS: Record<SupportChannel['id'], ReactNode> = {
  telegram: <Telegram fontSize="small" />,
  max: <ForumOutlined fontSize="small" />,
  email: <EmailOutlined fontSize="small" />,
  'knowledge-base': <MenuBookOutlined fontSize="small" />,
};

const SupportChannelItem = ({ channel }: { channel: SupportChannel }) => (
  <Link
    href={channel.href}
    target="_blank"
    rel="noopener noreferrer"
    underline="none"
    sx={{
      display: 'block',
      p: 2,
      borderRadius: '16px',
      bgcolor: 'secondary.light',
      border: '1px solid',
      borderColor: 'secondary.main',
      color: 'text.primary',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      '&:hover': {
        bgcolor: 'secondary.main',
        borderColor: 'primary.main',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center' }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: 'flex',
          borderRadius: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          color: 'primary.main',
        }}
      >
        {CHANNEL_ICONS[channel.id]}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          {channel.label}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {channel.description}
        </Typography>
      </Box>

      <OpenInNew
        fontSize="small"
        sx={{ color: 'text.secondary', flexShrink: 0 }}
      />
    </Stack>
  </Link>
);

export const HelpDialog = ({ open, onClose }: HelpDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    sx={{
      '& .MuiDialog-paper': {
        outline: 'none',
        overflow: 'visible',
        position: 'relative',
        borderRadius: '32px',
        width: '100%',
        maxWidth: 520,
      },
    }}
  >
    <IconButton
      onClick={onClose}
      color="primary"
      aria-label="Закрыть"
      sx={{
        top: 0,
        right: -60,
        position: 'absolute',
        bgcolor: 'secondary.main',
        ':hover': {
          bgcolor: 'secondary.light',
        },
      }}
    >
      <Close />
    </IconButton>

    <Box sx={{ p: 4 }}>
      <Typography variant="h6">Нужна помощь?</Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        Вы можете написать нам в социальные сети — Telegram или MAX, на нашу
        электронную почту или найти ответ в базе знаний.
      </Typography>

      <Stack
        spacing={1.5}
        sx={{ mt: 3 }}
      >
        {SUPPORT_CHANNELS.map(channel => (
          <SupportChannelItem
            key={channel.id}
            channel={channel}
          />
        ))}
      </Stack>
    </Box>
  </Dialog>
);

export default HelpDialog;
