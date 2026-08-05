import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { APPLICATION_STATUS_LABELS } from '@/entities';

import { useMyPostFilterStore } from '../model/store';

import type { ApplicationStatusFilter } from '../model/utils';

type DraftFilters = {
  status: ApplicationStatusFilter;
  postId: string;
  q: string;
};

const defaultDraft: DraftFilters = {
  q: '',
  status: 'all',
  postId: 'all',
};

export const MyPostSideBarFilter = () => {
  const {
    q,
    setQ,
    posts,
    status,
    postId,
    setPostId,
    setStatus,
    isOpenFilter,
    resetFilters,
    setIsOpenFilter,
  } = useMyPostFilterStore();

  const [draft, setDraft] = useState<DraftFilters>(defaultDraft);

  useEffect(() => {
    if (!isOpenFilter) return;

    setTimeout(() => {
      setDraft({
        status,
        postId,
        q,
      });
    }, 0);
  }, [isOpenFilter, status, postId, q]);

  const postOptions = useMemo(() => {
    const map = new Map<string, string>();

    posts?.items.forEach(application => {
      const id = application.post?.id;
      const title = application.post?.title;

      if (id && title) {
        map.set(id, title);
      }
    });

    return Array.from(map.entries());
  }, [posts]);

  const handleApply = () => {
    setQ(draft.q);
    setStatus(draft.status);
    setPostId(draft.postId);
    setIsOpenFilter(false);
  };

  const handleReset = () => {
    resetFilters();
    setDraft(defaultDraft);
    setIsOpenFilter(false);
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}
        >
          <Typography variant="h6">Фильтры</Typography>
          <IconButton onClick={() => setIsOpenFilter(false)}>
            <Close />
          </IconButton>
        </Stack>

        <TextField
          label="Статус"
          fullWidth
          select
          value={draft.status}
          onChange={event =>
            setDraft(prev => ({
              ...prev,
              status: event.target.value as ApplicationStatusFilter,
            }))
          }
        >
          <MenuItem value="all">Все</MenuItem>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
            <MenuItem
              key={value}
              value={value}
            >
              {label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Объявление"
          fullWidth
          select
          sx={{
            mt: 3,
          }}
          value={draft.postId}
          onChange={event =>
            setDraft(prev => ({ ...prev, postId: event.target.value }))
          }
        >
          <MenuItem value="all">Все</MenuItem>
          {postOptions.map(([id, title]) => (
            <MenuItem
              key={id}
              value={id}
            >
              {title}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Stack spacing={1}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleApply}
        >
          Применить
        </Button>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={handleReset}
        >
          Сбросить
        </Button>
      </Stack>
    </Stack>
  );
};
