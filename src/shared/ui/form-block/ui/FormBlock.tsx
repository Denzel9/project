import { Box, Typography } from '@mui/material';

type FormBlockProps = {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  isSingleColumn?: boolean;
};

export const FormBlockRowItem = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Box sx={{ gridColumn: 'span 2', width: '100%' }}>{children}</Box>;
};

export const FormBlock = ({
  title,
  children,
  isSingleColumn = false,
}: FormBlockProps) => {
  return (
    <Box sx={{ mt: 6 }}>
      {title && typeof title === 'string' && (
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 4 }}
        >
          {title}
        </Typography>
      )}

      {title && typeof title !== 'string' && title}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isSingleColumn ? '1fr' : '1fr 1fr',
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
