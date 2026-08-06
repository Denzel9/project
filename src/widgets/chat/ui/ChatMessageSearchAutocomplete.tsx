import {
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import {
  getMessagePreview,
  useSearchMessagesQuery,
  type ChatMessage,
} from '@/entities/chat'

type ChatMessageSearchAutocompleteProps = {
  conversationId: string | null
  autoFocus?: boolean
  size?: 'small' | 'medium'
  label?: string
  sx?: object
  onSelect: (message: ChatMessage) => void
}

export const ChatMessageSearchAutocomplete = ({
  conversationId,
  autoFocus = false,
  size = 'small',
  label = 'Поиск',
  sx,
  onSelect,
}: ChatMessageSearchAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null,
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [inputValue])

  const canSearch = Boolean(conversationId) && debouncedQuery.length >= 2

  const { data, isFetching } = useSearchMessagesQuery(
    canSearch ? conversationId : null,
    { q: debouncedQuery, page: 1, limit: 20 },
  )

  const options = useMemo(() => data?.items ?? [], [data?.items])

  return (
    <Autocomplete
      size={size}
      forcePopupIcon={false}
      clearOnBlur={false}
      blurOnSelect
      value={selectedMessage}
      inputValue={inputValue}
      options={options}
      loading={canSearch && isFetching}
      filterOptions={x => x}
      getOptionLabel={option =>
        getMessagePreview(option.content, option.media ?? [], option.isRedirected)
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
      slotProps={{
        paper: {
          sx: { borderRadius: '16px', minWidth: 320 },
        },
      }}
      sx={{ width: 240, ...sx }}
      loadingText={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <CircularProgress size={22} />
        </Box>
      }
      noOptionsText={
        debouncedQuery.length < 2
          ? 'Введите минимум 2 символа'
          : 'Ничего не найдено'
      }
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(value)
          if (reason === 'clear') {
            setSelectedMessage(null)
          }
        }
      }}
      onChange={(_, value) => {
        setSelectedMessage(value)
        if (value) {
          onSelect(value)
        }
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props
        const preview = getMessagePreview(
          option.content,
          option.media ?? [],
          option.isRedirected,
        )

        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{ display: 'block !important', py: 1 }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(option.createdAt), 'dd.MM.yyyy HH:mm')}
              </Typography>
              <Typography variant="body2" noWrap>
                {preview}
              </Typography>
            </Stack>
          </Box>
        )
      }}
      renderInput={params => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          label={label}
          placeholder="По сообщениям…"
        />
      )}
    />
  )
}
