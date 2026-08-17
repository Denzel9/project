import {
  Checkbox,
  MenuItem,
  TextField,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useState, type ChangeEvent } from 'react'

export type FilterStatusOption<T extends string = string> = {
  value: T
  label: string
}

type FilterStatusSelectProps<T extends string> = {
  value: T[]
  options: FilterStatusOption<T>[]
  onChange: (value: T[]) => void
  label?: string
  allLabel?: string
  size?: 'small' | 'medium'
  sx?: SxProps<Theme>
}

const ALL_VALUE = '__all__'

export const FilterStatusSelect = <T extends string>({
  value,
  options,
  onChange,
  label = 'Статус',
  allLabel = 'Все',
  size = 'small',
  sx,
}: FilterStatusSelectProps<T>) => {
  const [open, setOpen] = useState(false)
  const labels = new Map(options.map(option => [option.value, option.label]))

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const raw = event.target.value as unknown as string | T[]
    const next = (typeof raw === 'string' ? raw.split(',') : raw) as string[]

    if (next.includes(ALL_VALUE) || next.length === options.length) {
      onChange([])
      return
    }

    onChange(next.filter(Boolean) as T[])
  }

  return (
    <TextField
      select
      fullWidth
      label={label}
      size={size}
      value={value}
      onChange={handleChange}
      sx={sx}
      slotProps={{
        inputLabel: { shrink: true },
        select: {
          multiple: true,
          open,
          displayEmpty: true,
          onOpen: () => setOpen(true),
          onClose: () => setOpen(false),
          MenuProps: {
            disableAutoFocusItem: true,
          },
          renderValue: selected => {
            const items = selected as T[]

            if (!items.length) return allLabel

            return items
              .map(item => labels.get(item) ?? item)
              .join(', ')
          },
        },
      }}
    >
      <MenuItem
        value={ALL_VALUE}
        onMouseDown={event => event.preventDefault()}
      >
        <Checkbox
          size="small"
          checked={value.length === 0}
          sx={{ mr: 1, p: 0.5 }}
        />
        {allLabel}
      </MenuItem>

      {options.map(option => (
        <MenuItem
          key={option.value}
          value={option.value}
          onMouseDown={event => event.preventDefault()}
        >
          <Checkbox
            size="small"
            checked={value.includes(option.value)}
            sx={{ mr: 1, p: 0.5 }}
          />
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
