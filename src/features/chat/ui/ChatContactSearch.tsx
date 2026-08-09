import { Check, FilterList, Search } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useSearchUsersQuery, type UserSearchItem } from '@/entities/user';

type ChatContactSearchProps = {
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  excludeUserIds?: string[];
  onSelect: (user: UserSearchItem) => void | Promise<void>;
};

export const ChatContactSearch = ({
  placeholder = 'Имя или компания',
  disabled = false,
  size = 'medium',
  excludeUserIds,
  onSelect,
}: ChatContactSearchProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const { data: searchData, isFetching: isSearching } = useSearchUsersQuery(
    { q: debouncedQuery, page: 1, limit: 20 },
    { enabled: debouncedQuery.length >= 2 && !disabled }
  );

  const excludeSet = useMemo(
    () => new Set(excludeUserIds ?? []),
    [excludeUserIds]
  );

  const options = useMemo(
    () => (searchData?.items ?? []).filter(item => !excludeSet.has(item.id)),
    [excludeSet, searchData?.items]
  );

  const handleSelectUser = async (user: UserSearchItem | null) => {
    setSelectedUser(user);
    if (!user) return;

    setIsOpening(true);
    try {
      await onSelect(user);
      setInputValue('');
      setSelectedUser(null);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>


      <Autocomplete
        fullWidth
        size={size}
        forcePopupIcon={false}
        disabled={disabled}
        value={selectedUser}
        inputValue={inputValue}
        options={options}
        loading={isSearching || isOpening}
        filterOptions={x => x}
        getOptionLabel={option => option.displayName}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        slotProps={{
          paper: {
            sx: { borderRadius: '32px' },
          },
        }}
        loadingText={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <CircularProgress size={22} />
          </Box>
        }
        noOptionsText={
          debouncedQuery.length < 2
            ? 'Введите минимум 2 символа'
            : 'Никого не найдено'
        }
        onInputChange={(_, value, reason) => {
          if (reason === 'input' || reason === 'clear') {
            setInputValue(value);
          }
        }}
        onChange={(_, value) => {
          void handleSelectUser(value);
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
            >
              <Avatar
                src={option.avatar ?? undefined}
                sx={{ width: 32, height: 32 }}
              >
                {option.displayName.charAt(0)}
              </Avatar>
              <Stack
                spacing={0}
                sx={{ minWidth: 0 }}
              >
                <Typography
                  variant="body2"
                  noWrap
                >
                  {option.displayName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {option.role === 'COMPANY' ? 'Компания' : 'Исполнитель'}
                </Typography>
              </Stack>
            </Box>
          );
        }}
        renderInput={params => (
          <TextField
            {...params}
            // label={label}
            placeholder={placeholder}
            slotProps={{
              input: {
                startAdornment: (
                  <IconButton>
                    <Search />
                  </IconButton>
                ),
              },
            }}
          />
        )}
      />

      <IconButton onClick={(event) => setMenuAnchorEl(event.currentTarget)}>
        <FilterList />
      </IconButton>

      <Menu
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        anchorEl={menuAnchorEl}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            borderRadius: '24px',
          },
        }}
      >
        <MenuItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography>Все</Typography>
          <Check />
        </MenuItem>
        <MenuItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography>Непрочитано</Typography>
          <Check />
        </MenuItem>
      </Menu>
    </Stack>
  );
};
