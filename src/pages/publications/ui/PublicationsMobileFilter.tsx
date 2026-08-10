import { Close } from '@mui/icons-material'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import {
  FilterAutocomplete,
  type FilterAutocompleteOption,
} from '@/shared'

import { SEARCH_MIN } from '../model/constants'

import type {
  PublicationExecutorFilter,
  PublicationPostFilter,
} from '../model/utils'

type Draft = {
  postId: PublicationPostFilter
  executorId: PublicationExecutorFilter
  selectedPost: FilterAutocompleteOption | null
  selectedExecutor: FilterAutocompleteOption | null
}

type PublicationsMobileFilterProps = {
  open: boolean
  onClose: () => void
  postId: PublicationPostFilter
  executorId: PublicationExecutorFilter
  postOptions: FilterAutocompleteOption[]
  executorOptions: FilterAutocompleteOption[]
  selectedPostOption?: FilterAutocompleteOption | null
  selectedExecutorOption?: FilterAutocompleteOption | null
  isPostSearchLoading?: boolean
  isExecutorSearchLoading?: boolean
  onPostChange: (value: PublicationPostFilter) => void
  onExecutorChange: (value: PublicationExecutorFilter) => void
  onPostSearch: (query: string) => void
  onExecutorSearch: (query: string) => void
}

export const PublicationsMobileFilter = ({
  open,
  onClose,
  postId,
  executorId,
  postOptions,
  executorOptions,
  selectedPostOption = null,
  selectedExecutorOption = null,
  isPostSearchLoading = false,
  isExecutorSearchLoading = false,
  onPostChange,
  onExecutorChange,
  onPostSearch,
  onExecutorSearch,
}: PublicationsMobileFilterProps) => {
  const [draft, setDraft] = useState<Draft>({
    postId,
    executorId,
    selectedPost: selectedPostOption,
    selectedExecutor: selectedExecutorOption,
  })

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({
        postId,
        executorId,
        selectedPost: selectedPostOption,
        selectedExecutor: selectedExecutorOption,
      })
    }, 0)
  }, [open, postId, executorId, selectedPostOption, selectedExecutorOption])

  const handleApply = () => {
    onPostChange(draft.postId)
    onExecutorChange(draft.executorId)
    onClose()
  }

  const handleReset = () => {
    setDraft({
      postId: 'all',
      executorId: 'all',
      selectedPost: null,
      selectedExecutor: null,
    })
    onPostChange('all')
    onExecutorChange('all')
    onClose()
  }

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
          <FilterAutocomplete
            label="Задача"
            value={draft.postId}
            options={postOptions}
            selectedOption={draft.selectedPost}
            loading={isPostSearchLoading}
            minInputLength={SEARCH_MIN}
            onSearch={onPostSearch}
            onChange={value => {
              const next = value as PublicationPostFilter
              const fromOptions = postOptions.find(option => option.id === next)

              setDraft(prev => ({
                ...prev,
                postId: next,
                selectedPost:
                  next === 'all'
                    ? null
                    : (fromOptions ??
                      (prev.selectedPost?.id === next
                        ? prev.selectedPost
                        : null)),
              }))
            }}
            sx={{ width: '100%' }}
          />

          <FilterAutocomplete
            label="Исполнитель"
            value={draft.executorId}
            options={executorOptions}
            selectedOption={draft.selectedExecutor}
            loading={isExecutorSearchLoading}
            minInputLength={SEARCH_MIN}
            onSearch={onExecutorSearch}
            onChange={value => {
              const next = value as PublicationExecutorFilter
              const fromOptions = executorOptions.find(
                option => option.id === next,
              )

              setDraft(prev => ({
                ...prev,
                executorId: next,
                selectedExecutor:
                  next === 'all'
                    ? null
                    : (fromOptions ??
                      (prev.selectedExecutor?.id === next
                        ? prev.selectedExecutor
                        : null)),
              }))
            }}
            sx={{ width: '100%' }}
          />
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 4 }}
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
  )
}
