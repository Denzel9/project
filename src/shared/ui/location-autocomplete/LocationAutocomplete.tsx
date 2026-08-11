import { Autocomplete, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { useGeoSearchQuery, type GeoPlace } from '@/entities/geo'

type LocationAutocompleteProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  control: Control<TFieldValues>
  label?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
  onPlaceSelect?: (place: GeoPlace | null) => void
}

export const LocationAutocomplete = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label = 'Местоположение',
  fullWidth = true,
  size = 'medium',
  onPlaceSelect,
}: LocationAutocompleteProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({ name, control })

  const [inputValue, setInputValue] = useState(
    typeof field.value === 'string' ? field.value : ''
  )
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<GeoPlace | null>(null)

  useEffect(() => {
    const next = typeof field.value === 'string' ? field.value : ''

    setTimeout(() => {
      setInputValue(current => (current === next ? current : next))
    }, 0)
  }, [field.value])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [inputValue])

  const { data: options = [], isFetching } = useGeoSearchQuery(debouncedQuery)

  const applyPlace = (place: GeoPlace | null) => {
    setSelectedPlace(place)
    onPlaceSelect?.(place)
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ width: '100%', alignItems: 'center' }}
    >
      <Autocomplete
        sx={{ flex: 1 }}
        freeSolo
        size={size}
        fullWidth={fullWidth}
        options={options}
        filterOptions={x => x}
        getOptionLabel={option =>
          typeof option === 'string' ? option : option.label
        }
        isOptionEqualToValue={(option, value) => {
          const optionLabel =
            typeof option === 'string' ? option : option.label
          const valueLabel = typeof value === 'string' ? value : value.label
          return optionLabel === valueLabel
        }}
        value={
          (typeof field.value === 'string' && field.value
            ? field.value
            : null) as string | GeoPlace | null
        }
        inputValue={inputValue}
        onInputChange={(_, value, reason) => {
          if (reason === 'reset') return
          setInputValue(value)
          if (selectedPlace && value !== selectedPlace.label) {
            applyPlace(null)
          }
        }}
        onChange={(_, value) => {
          if (typeof value === 'string') {
            applyPlace(null)
            field.onChange(value)
            return
          }

          applyPlace(value)
          field.onChange(value?.label ?? '')
        }}
        onBlur={() => {
          field.onChange(inputValue.trim())
          field.onBlur()
        }}
        loading={isFetching}
        noOptionsText={
          debouncedQuery.length < 2
            ? 'Введите минимум 2 символа'
            : isFetching
              ? 'Поиск…'
              : 'Ничего не найдено'
        }
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                autoComplete: 'new-password',
              },
            }}
          />
        )}
      />
    </Stack>
  )
}
