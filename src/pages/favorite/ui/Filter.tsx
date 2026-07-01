import { Delete, Search } from '@mui/icons-material';
import { IconButton, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';

import {
  useDeleteFavoriteGroupMutation,
  useFavoriteGroupsQuery,
  type FavoriteGroup,
  type FavoriteType,
} from '@/entities/favorite';
import { useScroll } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { DeleteFavoriteGroupDialog } from './DeleteFavoriteGroupDialog';
import { FavoriteSearchPanel } from './FavoriteSearchPanel';

import type { FavoriteGroupFilter } from '../model/utils';

type FavoriteFilterProps = {
  value: FavoriteGroupFilter;
  favoriteType: FavoriteType;
  onChange: (value: FavoriteGroupFilter) => void;
  onTypeChange: (value: FavoriteType) => void;
};

const FavoriteFilter = ({
  value,
  favoriteType,
  onChange,
  onTypeChange,
}: FavoriteFilterProps) => {
  const { isScrolled, ref } = useScroll(150);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();

  const { data: groups, isLoading } = useFavoriteGroupsQuery(
    favoriteType === 'POST',
  );

  const { mutateAsync: deleteGroup, isPending } =
    useDeleteFavoriteGroupMutation();

  const [groupToDelete, setGroupToDelete] = useState<FavoriteGroup | null>(
    null,
  );

  const handleDeleteSuccess = (group: FavoriteGroup) => {
    if (value === group.id) {
      onChange('all');
    }

    setSnackbarOpen?.(
      true,
      group.count > 0
        ? 'Подборка удалена. Посты остались в избранном.'
        : 'Подборка удалена.',
    );
  };

  const handleDeleteGroup = async (group: FavoriteGroup) => {
    await deleteGroup(group.id);
    handleDeleteSuccess(group);
  };

  const handleDeleteClick = async (group: FavoriteGroup) => {
    if (group.count > 0) {
      setGroupToDelete(group);
      return;
    }

    await handleDeleteGroup(group);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;

    await handleDeleteGroup(groupToDelete);
    setGroupToDelete(null);
  };

  const handleTypeChange = (nextType: FavoriteType) => {
    onTypeChange(nextType);

    if (nextType !== 'POST' && value !== 'all') {
      onChange('all');
    }
  };

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        sx={{
          px: 2,
          pb: 2,
          alignItems: 'center',
          pt: isScrolled ? 4 : 1,
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
          bgcolor: isScrolled ? 'white' : 'transparent',
          borderBottomLeftRadius: isScrolled ? '32px' : '0',
          borderBottomRightRadius: isScrolled ? '32px' : '0',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: { xs: '100%', md: '50%' } }}
        >
          <TextField
            select
            size="small"
            label="Категория"
            value={favoriteType}
            sx={{ width: { xs: '100%', md: favoriteType === 'POST' ? '50%' : '100%' } }}
            onChange={e => handleTypeChange(e.target.value as FavoriteType)}
          >
            <MenuItem value="POST">Посты</MenuItem>
            <MenuItem value="CREATOR">Креаторы</MenuItem>
            <MenuItem value="COMPANY">Компании</MenuItem>
          </TextField>

          {favoriteType === 'POST' && (
            <TextField
              select
              size="small"
              value={value}
              label="Подборки"
              disabled={isLoading}
              sx={{ width: { xs: '100%', md: '50%' } }}
              onChange={e => onChange(e.target.value as FavoriteGroupFilter)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="ungrouped">Без подборки</MenuItem>
              {groups?.map(group => (
                <MenuItem
                  key={group.id}
                  value={group.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <span>
                    {group.name} ({group.count})
                  </span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isPending}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      void handleDeleteClick(group);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
        >
          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>
        </Stack>
      </Stack>

      <DeleteFavoriteGroupDialog
        group={groupToDelete}
        isPending={isPending}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      <FavoriteSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        groupFilter={value}
        favoriteType={favoriteType}
      />
    </>
  );
};

export default FavoriteFilter;
