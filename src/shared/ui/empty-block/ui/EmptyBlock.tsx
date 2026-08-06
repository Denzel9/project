import { InboxOutlined } from '@mui/icons-material';
import { Stack, Typography, Button, type SxProps, type Theme } from '@mui/material';

type EmptyBlockProps = {
  sx?: SxProps<Theme>;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonOnClick?: () => void;
  hasActiveFilters?: boolean;
  resetFilters?: () => void;
  navigate?: () => void;
  icon?: React.ReactNode;
};

export const EmptyBlock = ({
  sx,
  title = 'Тут пока ничего нет',
  description,
  buttonText = 'На главную',
  buttonOnClick,
  hasActiveFilters = false,
  resetFilters,
  navigate,
  icon = <InboxOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />,
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
        ...sx,
      }}
    >
      <Stack spacing={1} direction="column" sx={{ alignItems: 'center' }}>
        {icon}
        <Typography
          variant="body1"
          color="info"
          sx={{ textAlign: 'center' }}
        >
          {hasActiveFilters ? 'По выбранным фильтрам ничего не найдено' : title}
        </Typography>

        {showDescription && (
          <Typography
            variant='caption'
            color="info"
            sx={{ textAlign: 'center' }}
          >
            {hasActiveFilters
              ? 'Попробуйте изменить фильтры или сбросить их'
              : description}
          </Typography>
        )}
      </Stack>

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
