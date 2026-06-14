import { Delete, Search, Tune } from '@mui/icons-material';
import {
  Drawer,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';

import {
  useDeleteFavoriteGroupMutation,
  useFavoriteGroupsQuery,
  type FavoriteGroup,
} from '@/entities/favorite';
import { useMainFilterStore } from '@/features/main-filter';
import { SideBarFilter } from '@/features/main-filter/ui/SideBarFilter';

import { DeleteFavoriteGroupDialog } from './DeleteFavoriteGroupDialog';
import { FavoriteSearchPanel } from './FavoriteSearchPanel';

import type { FavoriteGroupFilter } from '../model/utils';

type FavoriteFilterProps = {
  value: FavoriteGroupFilter;
  onChange: (value: FavoriteGroupFilter) => void;
};

const FavoriteFilter = ({ value, onChange }: FavoriteFilterProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const {
    isOpenMainFilter,
    setIsOpenMainFilter,
    // filters,
    // setFilters,
    // postsType,
    // setPostsType,
  } = useMainFilterStore();

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const { data: groups, isLoading } = useFavoriteGroupsQuery();

  const { mutateAsync: deleteGroup, isPending } =
    useDeleteFavoriteGroupMutation();

  const [groupToDelete, setGroupToDelete] = useState<FavoriteGroup | null>(
    null
  );

  const handleDeleteSuccess = (group: FavoriteGroup) => {
    if (value === group.id) {
      onChange('all');
    }

    setSnackbar({
      open: true,
      message:
        group.count > 0
          ? 'Подборка удалена. Посты остались в избранном.'
          : 'Подборка удалена.',
    });
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

  return (
    <>
      <Stack
        direction="row"
        sx={{
          p: 2,
          alignItems: 'center',
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          label="Подборки"
          select
          value={value}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          sx={{ width: { xs: '100%', md: '35%' } }}
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

        <Stack
          direction="row"
          spacing={1}
        >
          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>

          <IconButton onClick={() => setIsOpenMainFilter(!isOpenMainFilter)}>
            {isOpenMainFilter ? <Tune color="primary" /> : <Tune />}
          </IconButton>
        </Stack>
      </Stack>

      <DeleteFavoriteGroupDialog
        group={groupToDelete}
        isPending={isPending}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        message={snackbar.message}
        onClose={() => setSnackbar({ open: false, message: '' })}
      />

      <FavoriteSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        groupFilter={value}
      />

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(!isOpenMainFilter)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            width: { xs: '100%', sm: '80%', md: '25%' },
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32,
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </>
  );
};

export default FavoriteFilter;
