import { Box, type SxProps, type Theme, Typography } from '@mui/material';

type FormBlockProps = {
  sx?: SxProps<Theme>;
  gap?: number;
  children: React.ReactNode;
  isSingleColumn?: boolean;
  title?: string | React.ReactNode;
};

export const FormBlockRowItem = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Box sx={{ gridColumn: 'span 2', width: '100%' }}>{children}</Box>;
};

export const FormBlock = ({
  sx,
  title,
  gap = 2,
  children,
  isSingleColumn = false,
}: FormBlockProps) => {
  return (
    <Box sx={{ mt: 6, ...sx }}>
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
          gap,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
