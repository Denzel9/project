import { Stack, Typography, Button } from '@mui/material';

type EmptyBlockProps = {
  title: string;
  buttonText?: string;
  buttonOnClick?: () => void;
};

export const EmptyBlock = ({
  title = 'Тут пока ничего нет',
  buttonText = 'На главную',
  buttonOnClick = undefined,
}: EmptyBlockProps) => {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        width: 'fit-content',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: 'center', opacity: 0.3 }}
      >
        {title}
      </Typography>

      {buttonText && buttonOnClick && (
        <Button
          color="primary"
          variant="outlined"
          sx={{ width: 'fit-content' }}
          onClick={buttonOnClick}
        >
          {buttonText}
        </Button>
      )}
    </Stack>
  );
};
