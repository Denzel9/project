import { Close } from '@mui/icons-material'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import {
  APPLICATION_STATUS_LABELS,
  getPartnerName,
  mapPartnerUserToRow,
  normalizePartnerUser,
  usePartnerApplicantsQuery,
} from '@/entities'
import { FilterAutocomplete } from '@/shared'

import { useMyPostFilterStore } from '../model/store'

import type { ApplicationStatusFilter } from '../model/utils'

type Draft = {
  status: ApplicationStatusFilter
  postId: string
  userId: string
}

type PostsResponsesMobileFilterProps = {
  open: boolean
  onClose: () => void
  postOptions: { id: string; label: string }[]
}

export const PostsResponsesMobileFilter = ({
  open,
  onClose,
  postOptions,
}: PostsResponsesMobileFilterProps) => {
  const status = useMyPostFilterStore(state => state.status)
  const postId = useMyPostFilterStore(state => state.postId)
  const userId = useMyPostFilterStore(state => state.userId)
  const posts = useMyPostFilterStore(state => state.posts)
  const setStatus = useMyPostFilterStore(state => state.setStatus)
  const setPostId = useMyPostFilterStore(state => state.setPostId)
  const setUserId = useMyPostFilterStore(state => state.setUserId)

  const [draft, setDraft] = useState<Draft>({
    status,
    postId,
    userId,
  })

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({ status, postId, userId })
    }, 0)
  }, [open, status, postId, userId])

  const { data: applicantsData, isLoading: isApplicantsLoading } =
    usePartnerApplicantsQuery({ sort: 'name' }, { enabled: open })

  const statusOptions = useMemo(
    () =>
      Object.entries(APPLICATION_STATUS_LABELS).map(([id, label]) => ({
        id,
        label,
      })),
    [],
  )

  const userOptions = useMemo(() => {
    const fromApi = (applicantsData?.items ?? [])
      .map(normalizePartnerUser)
      .map(mapPartnerUserToRow)
      .map(item => ({ id: item.id, label: item.name }))

    if (fromApi.length) return fromApi

    const map = new Map<string, string>()

    posts?.items.forEach(application => {
      const applicant = application.applicant

      if (!applicant?.id) return

      map.set(applicant.id, getPartnerName(applicant))
    })

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [applicantsData?.items, posts])

  const handleApply = () => {
    setStatus(draft.status)
    setPostId(draft.postId)
    setUserId(draft.userId)
    onClose()
  }

  const handleReset = () => {
    setDraft({
      status: 'all',
      postId: 'all',
      userId: 'all',
    })
    setStatus('all')
    setPostId('all')
    setUserId('all')
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
            label="Статус"
            value={draft.status}
            options={statusOptions}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                status: value as ApplicationStatusFilter,
              }))
            }
            sx={{ width: '100%' }}
          />

          <FilterAutocomplete
            label="Объявление"
            value={draft.postId}
            options={postOptions}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                postId: value,
              }))
            }
            sx={{ width: '100%' }}
          />

          <FilterAutocomplete
            label="Пользователь"
            value={draft.userId}
            options={userOptions}
            loading={isApplicantsLoading}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                userId: value,
              }))
            }
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
