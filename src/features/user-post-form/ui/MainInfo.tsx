import { ChevronLeft } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { WorkFormatEnum, getWorkFormatLabel } from '@/entities/post'
import { useAuthStore } from '@/features/auth'
import { RHFInput, RHFSwitch } from '@/shared/ui/rhf'

import MenuButton from './MenuButton'

const ADVANTAGE_OPTIONS = [
  'Удаленно',
  'На месте работодателя',
  'По договору',
]

type Props = {
  isEdit?: boolean
  menuOptions?: string[]
  onMenuAction?: (action: string) => void
}

export const MainInfo = ({
  isEdit = false,
  menuOptions = [],
  onMenuAction,
}: Props) => {
  const { control, setValue } = useFormContext()
  const { role } = useAuthStore()

  const { chips } = useWatch({
    control,
  })

  const navigate = useNavigate()

  const handleSetChips = (value: string) => {
    const current = chips ?? []

    if (current.includes(value)) {
      setValue(
        'chips',
        current.filter((type: string) => type !== value),
      )
    } else {
      setValue('chips', [...current, value])
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <IconButton onClick={() => navigate(-1)}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: 20, lg: 30 },
              display: { xs: 'none', lg: 'block' },
            }}
          >
            {isEdit
              ? `Редактирование ${role === 'company' ? 'объявления' : 'поста'}`
              : `Новый ${role === 'company' ? 'объявление' : 'пост'}`}
          </Typography>
        </Box>

        {isEdit && menuOptions.length > 0 && onMenuAction && (
          <MenuButton
            options={menuOptions}
            onAction={onMenuAction}
          />
        )}
      </Box>

      <Box sx={{ width: { lg: '50%', xs: '100%' } }}>
        <RHFInput
          name="title"
          control={control}
          maxLength={40}
          props={{
            sx: { my: 4 },
            fullWidth: true,
            label: 'Название',
            helperText: 'Например, «UGС Creator», Bloger, «Model»',
          }}
        />

        <Box
          sx={{
            mb: 4,
            gap: 1,
            display: 'flex',
            flexWrap: 'wrap',
            width: { lg: '70%', xs: '100%' },
          }}
        >
          {ADVANTAGE_OPTIONS.map(option => (
            <Chip
              key={option}
              label={option}
              onClick={() => handleSetChips(option)}
              color={(chips ?? []).includes(option) ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <Controller
          name="workFormat"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Формат работы"
              error={!!fieldState?.error}
              value={field.value || ''}
              helperText={fieldState?.error?.message}
              onChange={field.onChange}
              sx={{ width: { lg: '50%', xs: '100%' }, mb: 4 }}
            >
              {Object.values(WorkFormatEnum).map(option => (
                <MenuItem
                  key={option}
                  value={option}
                >
                  {getWorkFormatLabel(option)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Box sx={{ mb: 2 }}>
          <RHFSwitch
            name="isPrivate"
            control={control}
            label="Приватный пост"
            description="Видно только вам"
          />
        </Box>
      </Box>
    </Box>
  )
}
