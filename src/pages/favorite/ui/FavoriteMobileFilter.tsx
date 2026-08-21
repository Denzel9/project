import { Close, Delete } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

import { USER_ROLE } from '@/entities'
import {
  useDeleteFavoriteGroupMutation,
  useFavoriteGroupsQuery,
  type FavoriteGroup,
  type FavoriteType,
} from '@/entities/favorite'
import { useAuthStore } from '@/features'
import { mobileFilterActionsSx } from '@/shared'
import { useSnackbarStore } from '@/widgets'

import { DeleteFavoriteGroupDialog } from './DeleteFavoriteGroupDialog'

import type { FavoriteGroupFilter } from '../model/utils'

type FavoriteMobileFilterProps = {
  open: boolean
  onClose: () => void
  value: FavoriteGroupFilter
  favoriteType: FavoriteType
  onChange: (value: FavoriteGroupFilter) => void
  onTypeChange: (value: FavoriteType) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
}

type Draft = {
  favoriteType: FavoriteType
  group: FavoriteGroupFilter
  searchQuery: string
}

export const FavoriteMobileFilter = ({
  open,
  onClose,
  value,
  favoriteType,
  onChange,
  onTypeChange,
  searchQuery,
  onSearchQueryChange,
}: FavoriteMobileFilterProps) => {
  const { role } = useAuthStore()
  const { setSnackbarOpen } = useSnackbarStore()
  const isCompany = role === USER_ROLE.COMPANY

  const [draft, setDraft] = useState<Draft>({
    favoriteType,
    group: value,
    searchQuery,
  })

  const { data: groups, isLoading } = useFavoriteGroupsQuery(
    open && draft.favoriteType === 'POST',
  )

  const { mutateAsync: deleteGroup, isPending } =
    useDeleteFavoriteGroupMutation()

  const [groupToDelete, setGroupToDelete] = useState<FavoriteGroup | null>(
    null,
  )

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({
        favoriteType,
        group: value,
        searchQuery,
      })
    }, 0)
  }, [open, favoriteType, value, searchQuery])

  const handleDeleteSuccess = (group: FavoriteGroup) => {
    if (draft.group === group.id) {
      setDraft(prev => ({ ...prev, group: 'all' }))
    }

    if (value === group.id) {
      onChange('all')
    }

    setSnackbarOpen?.(
      true,
      group.count > 0
        ? 'Подборка удалена. Посты остались в избранном.'
        : 'Подборка удалена.',
    )
  }

  const handleDeleteGroup = async (group: FavoriteGroup) => {
    await deleteGroup(group.id)
    handleDeleteSuccess(group)
  }

  const handleDeleteClick = async (group: FavoriteGroup) => {
    if (group.count > 0) {
      setGroupToDelete(group)
      return
    }

    await handleDeleteGroup(group)
  }

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return

    await handleDeleteGroup(groupToDelete)
    setGroupToDelete(null)
  }

  const handleTypeChange = (nextType: FavoriteType) => {
    setDraft(prev => ({
      ...prev,
      favoriteType: nextType,
      group: nextType !== 'POST' ? 'all' : prev.group,
    }))
  }

  const handleApply = () => {
    onTypeChange(draft.favoriteType)
    onChange(draft.favoriteType === 'POST' ? draft.group : 'all')
    onSearchQueryChange(draft.searchQuery.trim())
    onClose()
  }

  const handleReset = () => {
    const nextType: FavoriteType = 'POST'
    setDraft({
      favoriteType: nextType,
      group: 'all',
      searchQuery: '',
    })
    onTypeChange(nextType)
    onChange('all')
    onSearchQueryChange('')
    onClose()
  }

  return (
    <>
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
            sx={{
              mb: 4,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">Фильтры</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Поиск"
              value={draft.searchQuery}
              onChange={event =>
                setDraft(prev => ({
                  ...prev,
                  searchQuery: event.target.value,
                }))
              }
            />

            <TextField
              select
              fullWidth
              label="Категория"
              value={draft.favoriteType}
              onChange={event =>
                handleTypeChange(event.target.value as FavoriteType)
              }
            >
              <MenuItem value="POST">Посты</MenuItem>
              <MenuItem value={isCompany ? 'CREATOR' : 'COMPANY'}>
                {isCompany ? 'Исполнители' : 'Компании'}
              </MenuItem>
            </TextField>

            {draft.favoriteType === 'POST' && (
              <TextField
                select
                fullWidth
                label="Подборки"
                value={draft.group}
                disabled={isLoading}
                onChange={event =>
                  setDraft(prev => ({
                    ...prev,
                    group: event.target.value as FavoriteGroupFilter,
                  }))
                }
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
                      onMouseDown={event => event.stopPropagation()}
                      onClick={event => {
                        event.stopPropagation()
                        void handleDeleteClick(group)
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={mobileFilterActionsSx}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleReset}
          >
            Сбросить
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
          >
            Применить
          </Button>
        </Stack>
      </Stack>

      <DeleteFavoriteGroupDialog
        group={groupToDelete}
        isPending={isPending}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
