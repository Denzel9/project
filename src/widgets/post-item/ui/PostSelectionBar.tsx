import { Close } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import type { ReactNode } from 'react';

export type PostSelectionBarAction = {
  label: string;
  icon: ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
  color?: 'inherit' | 'primary' | 'error';
  onClick: () => void;
};

type PostSelectionBarProps = {
  selectedCount: number;
  totalCount: number;
  isUpdating?: boolean;
  onClose: () => void;
  onSelectAll: () => void;
  actions: PostSelectionBarAction[];
};

export const PostSelectionBar = ({
  selectedCount,
  totalCount,
  isUpdating = false,
  onClose,
  onSelectAll,
  actions,
}: PostSelectionBarProps) => {
  const hasSelection = selectedCount > 0;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <Paper
      elevation={8}
      sx={{
        left: '50%',
        position: 'fixed',
        p: { xs: 1.5, md: 2 },
        borderRadius: '24px',
        bottom: { xs: 0, md: 24 },
        transform: 'translateX(-50%)',
        zIndex: theme => theme.zIndex.snackbar,
        borderBottomLeftRadius: { xs: 0, md: 24 },
        borderBottomRightRadius: { xs: 0, md: 24 },
        width: { xs: '100%', md: 'min(800px, calc(100% - 32px))' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
        >
          <IconButton
            aria-label="Закрыть выбор"
            onClick={onClose}
            disabled={isUpdating}
            size="small"
          >
            <Close />
          </IconButton>

          {selectedCount > 0 && <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 0 }}
          >
            Выбрано: {selectedCount}
          </Typography>}

          {totalCount > 0 && (
            <Button
              size="small"
              variant="text"
              disabled={isUpdating}
              onClick={onSelectAll}
              sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0, px: 2 }}
            >
              {allSelected ? 'Снять все' : 'Выбрать все'}
            </Button>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}
        >
          {actions.map(action => (
            <Button
              key={action.label}
              variant={action.variant ?? 'outlined'}
              color={action.color ?? 'inherit'}
              disabled={!hasSelection || isUpdating}
              onClick={action.onClick}
              startIcon={
                isUpdating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  action.icon
                )
              }
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
