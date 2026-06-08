import { Avatar, Box, Stack, Typography } from '@mui/material';

type ChatTypingIndicatorProps = {
  name: string;
  avatarSrc?: string;
};

export const ChatTypingIndicator = ({
  name,
  avatarSrc,
}: ChatTypingIndicatorProps) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        px: 1,
        mb: 1,
        left: 24,
        bottom: 24,
        position: 'fixed',
        alignItems: 'center',
      }}
    >
      <Avatar
        src={avatarSrc}
        sx={{ width: 28, height: 28 }}
      />

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {name} печатает
      </Typography>

      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center' }}
      >
        {[0, 1, 2].map(index => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'grey.400',
              animation: 'chatTypingDot 1.2s ease-in-out infinite',
              animationDelay: `${index * 0.2}s`,
              '@keyframes chatTypingDot': {
                '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                '40%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};
