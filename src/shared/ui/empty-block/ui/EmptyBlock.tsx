import { InboxOutlined } from '@mui/icons-material';
import { Stack, Typography, Button } from '@mui/material';

type EmptyBlockProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonOnClick?: () => void;
  hasActiveFilters?: boolean;
  resetFilters?: () => void;
  navigate?: () => void;
};

export const EmptyBlock = ({
  title = 'Тут пока ничего нет',
  description,
  buttonText = 'На главную',
  buttonOnClick,
  hasActiveFilters = false,
  resetFilters,
  navigate,
}: EmptyBlockProps) => {
  const showDescription = Boolean(
    hasActiveFilters || (description !== undefined && description !== '')
  );

  const action = hasActiveFilters ? resetFilters : (buttonOnClick ?? navigate);

  const showButton = Boolean(action);

  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <InboxOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {hasActiveFilters ? 'По выбранным фильтрам ничего не найдено' : title}
      </Typography>
      {showDescription && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {hasActiveFilters
            ? 'Попробуйте изменить фильтры или сбросить их'
            : description}
        </Typography>
      )}
      {showButton && (
        <Button
          variant="contained"
          onClick={() => action?.()}
        >
          {hasActiveFilters ? 'Сбросить фильтры' : buttonText}
        </Button>
      )}
    </Stack>
  );
};
