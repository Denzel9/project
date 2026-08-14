import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { USER_ROLE } from '@/entities';
import {
  areSameTiles,
  DASHBOARD_SWITCHES,
  type DashboardSwitchKey,
} from '@/entities/settings';
import {
  toDashboardTileType,
  useUpdateUserConfigMutation,
  useUserConfigQuery,
  userConfigKeys,
  type DashboardTileType,
  type UpdateUserConfigDto,
  type UserConfig,
} from '@/entities/user-config';
import {
  getDashboardCardOptions,
  getFastButtonLabel,
  useAuthStore,
  type DashboardCardVariant,
} from '@/features';
import { EmptyBlock } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { SettingsRow } from '../SettingsRow';

export const SettingsCrmDashboardPage = () => {
  const { isAuth, role } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const queryClient = useQueryClient();
  const isCompany = role === USER_ROLE.COMPANY;

  const availableVariants = useMemo(
    () => getDashboardCardOptions(isCompany),
    [isCompany]
  );

  const availableTypes = useMemo(
    () => availableVariants.map(toDashboardTileType),
    [availableVariants]
  );

  const { data, isLoading, isError, refetch } = useUserConfigQuery({
    enabled: isAuth,
  });

  const { mutateAsync: updateConfig, isPending } =
    useUpdateUserConfigMutation();

  const [isEditingTiles, setIsEditingTiles] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<DashboardTileType[]>([]);
  const [pendingSwitchKey, setPendingSwitchKey] =
    useState<DashboardSwitchKey | null>(null);

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setSelectedTiles(data.dashboardTiles ?? []);
    }, 0);
  }, [data]);

  const selectedSet = useMemo(() => new Set(selectedTiles), [selectedTiles]);

  const savedTilesForRole = useMemo(() => {
    if (!data) return [];

    const allowed = new Set(availableTypes);

    return (data.dashboardTiles ?? []).filter(type => allowed.has(type));
  }, [data, availableTypes]);

  const isTilesDirty = !areSameTiles(
    selectedTiles.filter(type => availableTypes.includes(type)),
    savedTilesForRole
  );

  const orderTilesByCatalog = (types: DashboardTileType[]) => {
    const selected = new Set(types);

    return availableTypes.filter(type => selected.has(type));
  };

  const handleToggleTile = (type: DashboardTileType, checked: boolean) => {
    setSelectedTiles(current => {
      if (checked) {
        return orderTilesByCatalog([...current, type]);
      }

      return current.filter(item => item !== type);
    });
  };

  const handleSaveTiles = async () => {
    try {
      const nextTiles = orderTilesByCatalog(selectedTiles);
      const next = await updateConfig({ dashboardTiles: nextTiles });

      setSelectedTiles(next.dashboardTiles ?? []);
      setIsEditingTiles(false);
      setSnackbarOpen(true, 'Настройки дашборда сохранены');
    } catch {
      setSnackbarOpen(true, 'Не удалось сохранить настройки');
    }
  };

  const handleSwitchChange = async (
    key: DashboardSwitchKey,
    checked: boolean
  ) => {
    setPendingSwitchKey(key);

    const previous = queryClient.getQueryData<UserConfig>(
      userConfigKeys.config()
    );

    if (previous) {
      queryClient.setQueryData<UserConfig>(userConfigKeys.config(), {
        ...previous,
        [key]: checked,
      });
    }

    try {
      const body = { [key]: checked } as UpdateUserConfigDto;

      await updateConfig(body);
      setSnackbarOpen(true, 'Настройки дашборда сохранены');
    } catch {
      if (previous) {
        queryClient.setQueryData(userConfigKeys.config(), previous);
      }

      setSnackbarOpen(true, 'Не удалось сохранить настройки');
    } finally {
      setPendingSwitchKey(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <EmptyBlock
          title="Не удалось загрузить настройки дашборда"
          description="Попробуйте позже"
          buttonText="Повторить"
          buttonOnClick={() => void refetch()}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Дашборд
      </Typography>

      <Stack
        spacing={4}
        sx={{ mt: 4 }}
        direction="column"
      >
        <Stack spacing={2}>
          <SettingsRow
            title="Активные плитки"
            description="Плитки вверху дашборда CRM"
            action={
              <Button
                variant="outlined"
                color="primary"
                sx={{ px: 2 }}
                onClick={() => {
                  if (isEditingTiles) {
                    setSelectedTiles(data.dashboardTiles ?? []);
                    setIsEditingTiles(false);
                    return;
                  }

                  setSelectedTiles(savedTilesForRole);
                  setIsEditingTiles(true);
                }}
              >
                {isEditingTiles ? 'Отмена' : 'Редактировать'}
              </Button>
            }
          />

          <Collapse
            in={isEditingTiles}
            sx={{ mt: isEditingTiles ? 2 : '0px !important' }}
          >
            <Stack
              spacing={2}
              sx={{ pt: 1 }}
            >
              <Stack spacing={1}>
                {availableVariants.map((variant: DashboardCardVariant) => {
                  const type = toDashboardTileType(variant);

                  return (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          checked={selectedSet.has(type)}
                          disabled={isPending}
                          onChange={event =>
                            handleToggleTile(type, event.target.checked)
                          }
                        />
                      }
                      label={getFastButtonLabel(variant)}
                    />
                  );
                })}
              </Stack>

              <Stack
                spacing={1}
                direction={{ xs: 'column', md: 'row' }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ px: 2 }}
                  disabled={isPending}
                  onClick={() => setSelectedTiles([...availableTypes])}
                >
                  Включить все
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ px: 2 }}
                  disabled={isPending || selectedTiles.length === 0}
                  onClick={() => setSelectedTiles([])}
                >
                  Выключить все
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ px: 2 }}
                  disabled={isPending}
                  onClick={() => {
                    setSelectedTiles(data.dashboardTiles ?? []);
                    setIsEditingTiles(false);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ px: 2 }}
                  disabled={!isTilesDirty || isPending}
                  onClick={() => void handleSaveTiles()}
                  startIcon={
                    isPending ? (
                      <CircularProgress
                        size={14}
                        color="inherit"
                      />
                    ) : undefined
                  }
                >
                  Сохранить
                </Button>
              </Stack>
            </Stack>
          </Collapse>
        </Stack>

        {DASHBOARD_SWITCHES.map(item => (
          <SettingsRow
            key={item.key}
            title={item.title}
            description={item.description}
            action={
              <Switch
                checked={data[item.key]}
                disabled={isPending || pendingSwitchKey === item.key}
                onChange={event =>
                  void handleSwitchChange(item.key, event.target.checked)
                }
              />
            }
          />
        ))}
      </Stack>
    </Box>
  );
};

export default SettingsCrmDashboardPage;
