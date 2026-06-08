import { Button, Stack, Typography } from '@mui/material';

type MembersHeaderProps = {
  onAddClick: () => void;
};

export const MembersHeader = ({ onAddClick }: MembersHeaderProps) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
    >
      <Stack spacing={0.5}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600 }}
        >
          Участники
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Управление участниками команды
        </Typography>
      </Stack>

      <Button
        variant="contained"
        onClick={onAddClick}
        sx={{ flexShrink: 0, px: 2 }}
      >
        Добавить участника
      </Button>
    </Stack>
  );
};
