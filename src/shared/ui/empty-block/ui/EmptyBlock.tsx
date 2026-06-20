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
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        sx={{
          opacity: 0.3,
          textAlign: 'center',
          fontSize: { xs: '24px', md: '34px' },
        }}
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
