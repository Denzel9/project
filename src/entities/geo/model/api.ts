import { useQuery } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type { GeoPlace } from './types'

export const geoKeys = {
  all: ['geo'] as const,
  search: (q: string, limit = 5) =>
    [...geoKeys.all, 'search', { q, limit }] as const,
}

export const useGeoSearchQuery = (q: string, limit = 1) => {
  const trimmed = q.trim()

  return useQuery({
    queryKey: geoKeys.search(trimmed, limit),
    queryFn: async () => {
      const { data } = await mainAxios.get<GeoPlace[]>('/geo/search', {
        params: { q: trimmed },
      })
      return data
    },
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  })
}
