export {
  userConfigKeys,
  fetchUserConfig,
  prefetchUserConfig,
  useUserConfigQuery,
  useUpdateUserConfigMutation,
} from './model/api'

export {
  DASHBOARD_TILE_TYPE,
  DASHBOARD_TILE_TYPES,
  DASHBOARD_TILE_VARIANT_BY_TYPE,
  DASHBOARD_TILE_TYPE_BY_VARIANT,
  toDashboardTileVariant,
  toDashboardTileType,
} from './model/types'

export type {
  UserConfig,
  UpdateUserConfigDto,
  DashboardTileType,
  DashboardTileVariant,
} from './model/types'
