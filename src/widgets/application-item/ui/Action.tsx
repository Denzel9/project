import { FavoriteBorderOutlined } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';

type ActionProps = {
  isApplied: boolean;
  setIsApplied: (isApplied: boolean) => void;
};

export const Action = ({ isApplied, setIsApplied }: ActionProps) => {
  return !isApplied ? (
    <Box
      sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}
      onClick={e => e.preventDefault()}
    >
      <Button
        variant="contained"
        onClick={() => {
          setIsApplied(true);
        }}
      >
        Откликнуться
      </Button>

      <IconButton onClick={() => {}}>
        <FavoriteBorderOutlined />
      </IconButton>
    </Box>
  ) : (
    <Box
      sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}
      onClick={e => e.preventDefault()}
    >
      <Button
        variant="contained"
        color="error"
        onClick={() => {
          setIsApplied(false);
        }}
      >
        Отменить отклик
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={e => {
          e.preventDefault();
          setIsApplied(false);
        }}
      >
        В чат
      </Button>

      <IconButton onClick={() => {}}>
        <FavoriteBorderOutlined />
      </IconButton>
    </Box>
  );
};
