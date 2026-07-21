import { Close } from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';

type PublicationSearchPanelProps = {
  open: boolean;
  query: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

export const PublicationSearchPanel = ({
  open,
  query,
  onClose,
  onQueryChange,
}: PublicationSearchPanelProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    if (open) {
      setLocalQuery(query);
    }
  }, [open, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onQueryChange(localQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [localQuery, onQueryChange]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : 400,
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}
      >
        <Typography variant="h6">Поиск публикаций</Typography>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        label="Название"
        value={localQuery}
        onChange={event => setLocalQuery(event.target.value)}
        helperText="Поиск по заголовку публикации"
        slotProps={{
          input: {
            endAdornment: localQuery ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setLocalQuery('')}>
                  <Close />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Результаты отображаются в списке публикаций
        </Typography>
      </Box>
    </Drawer>
  );
};
