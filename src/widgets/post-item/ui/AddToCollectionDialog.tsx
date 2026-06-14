import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  useAddFavoriteMutation,
  useCreateFavoriteGroupMutation,
  useFavoriteGroupsQuery,
} from '@/entities/favorite';

import { useApplicationItemStore } from '../model/store';

export const AddToCollectionDialog = () => {
  const {
    isOpenAddToCollectionDialog,
    addToCollectionPostId,
    setOpenAddToCollectionDialog,
  } = useApplicationItemStore();

  const { data: groups, isLoading: isGroupsLoading } =
    useFavoriteGroupsQuery();

  const { mutateAsync: addFavorite, isPending: isAddingFavorite } =
    useAddFavoriteMutation();
  const { mutateAsync: createGroup, isPending: isCreatingGroup } =
    useCreateFavoriteGroupMutation();

  const [tab, setTab] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const isPending = isAddingFavorite || isCreatingGroup;

  const resetState = () => {
    setTab(0);
    setSelectedGroupId('');
    setNewGroupName('');
  };

  const handleClose = () => {
    setOpenAddToCollectionDialog(false, null);
    resetState();
  };

  useEffect(() => {
    if (!isOpenAddToCollectionDialog) {
      resetState();
    }
  }, [isOpenAddToCollectionDialog]);

  const handleAddToSelected = async () => {
    if (!addToCollectionPostId) return;

    await addFavorite({
      postId: addToCollectionPostId,
      ...(selectedGroupId ? { groupId: selectedGroupId } : {}),
    });
    handleClose();
  };

  const handleCreateAndAdd = async () => {
    if (!addToCollectionPostId || !newGroupName.trim()) return;

    const created = await createGroup({ name: newGroupName.trim() });
    await addFavorite({
      postId: addToCollectionPostId,
      groupId: created.id,
    });
    handleClose();
  };

  return (
    <Dialog
      open={isOpenAddToCollectionDialog}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4, minWidth: 360 }}>
        <Typography variant="h6">Добавить в подборку</Typography>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ mt: 2 }}
        >
          <Tab label="Выбрать" />
          <Tab label="Создать" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ mt: 3 }}>
            <TextField
              select
              fullWidth
              label="Подборка"
              value={selectedGroupId}
              disabled={isGroupsLoading || isPending}
              onChange={e => setSelectedGroupId(e.target.value)}
            >
              <MenuItem value="">Без группы</MenuItem>
              {groups?.map(group => (
                <MenuItem
                  key={group.id}
                  value={group.id}
                >
                  {group.name} ({group.count})
                </MenuItem>
              ))}
            </TextField>

            <Stack
              direction="row"
              sx={{ mt: 4, justifyContent: 'flex-end', gap: 1 }}
            >
              <Button
                disabled={isPending}
                onClick={handleClose}
              >
                Отменить
              </Button>
              <Button
                variant="contained"
                disabled={isPending || !addToCollectionPostId}
                onClick={handleAddToSelected}
              >
                Добавить
              </Button>
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Название подборки"
              value={newGroupName}
              disabled={isPending}
              onChange={e => setNewGroupName(e.target.value)}
            />

            <Stack
              direction="row"
              sx={{ mt: 4, justifyContent: 'flex-end', gap: 1 }}
            >
              <Button
                disabled={isPending}
                onClick={handleClose}
              >
                Отменить
              </Button>
              <Button
                variant="contained"
                disabled={
                  isPending || !addToCollectionPostId || !newGroupName.trim()
                }
                onClick={handleCreateAndAdd}
              >
                Создать и добавить
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};
