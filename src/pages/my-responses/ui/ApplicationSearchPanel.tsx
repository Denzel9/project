import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useSearchMyApplicationsQuery,
  type Application,
} from '@/entities/application';
import { ROUTES } from '@/shared/config/routes';

import { ApplicationSearchResultItem } from './ApplicationSearchResultItem';

type ApplicationSearchPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const ApplicationSearchPanel = ({
  open,
  onClose,
}: ApplicationSearchPanelProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Application[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
      setItems([]);
    }, 0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery('');
        setDebouncedQuery('');
        setPage(1);
        setItems([]);
      }, 0);
    }
  }, [open]);

  const { data, isLoading, isFetching, error } = useSearchMyApplicationsQuery({
    q: debouncedQuery,
    page,
    limit: 20,
  });

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setItems(prev => (page === 1 ? data.items : [...prev, ...data.items]));
    }, 0);
  }, [data, page]);

  const hasMore = Boolean(data && data.page * data.limit < data.total);
  const canSearch = debouncedQuery.length >= 2;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleOpenPost = (postId: string) => {
    navigate(`${ROUTES.POST}/${postId}`);
    onClose();
  };

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
        <Typography variant="h6">Поиск по откликам</Typography>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        value={query}
        label="Поиск"
        onChange={event => setQuery(event.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setQuery('')}>
                  <Close />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box
        sx={{
          mt: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {!canSearch && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Введите минимум 2 символа
          </Typography>
        )}

        {canSearch && isLoading && items.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {canSearch && error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ textAlign: 'center', py: 2 }}
          >
            Не удалось выполнить поиск
          </Typography>
        )}

        {canSearch && !isLoading && !error && items.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Ничего не найдено
          </Typography>
        )}

        {items.map(application => (
          <ApplicationSearchResultItem
            key={application.id}
            application={application}
            highlightQuery={debouncedQuery}
            onOpen={handleOpenPost}
          />
        ))}

        {canSearch && hasMore && (
          <Button
            variant="outlined"
            disabled={isFetching}
            onClick={handleLoadMore}
          >
            {isFetching ? 'Загрузка…' : 'Загрузить ещё'}
          </Button>
        )}
      </Box>
    </Drawer>
  );
};
