import { Box, Button } from '@mui/material';

type TasksLoadMoreButtonProps = {
  hiddenCount: number;
  onClick: () => void;
};

export const TasksLoadMoreButton = ({
  hiddenCount,
  onClick,
}: TasksLoadMoreButtonProps) => {
  if (hiddenCount <= 0) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <Button
        size="small"
        variant="outlined"
        onClick={onClick}
      >
        Показать ещё
      </Button>
    </Box>
  );
};
