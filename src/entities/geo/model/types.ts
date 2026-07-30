export type GeoPlaceAddress = Record<string, string>

export type GeoPlace = {
  label: string
  display_name?: string | null
  place_id?: number | null
  osm_type?: string | null
  osm_id?: number | null
  licence?: string | null
  lat?: string | null
  lon?: string | null
  class?: string | null
  type?: string | null
  place_rank?: number | null
  importance?: number | null
  addresstype?: string | null
  name?: string | null
  boundingbox?: string[] | null
  address?: GeoPlaceAddress | null
  [key: string]: unknown
}
