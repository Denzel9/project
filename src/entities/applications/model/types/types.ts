
export type Application = {
  id?: string
  ownerId: string
  name: string
  dealType: string[]
  condition: string
  description: string
  size: string
  type: string
  subtype: string
  brand: string
  color: string
  price: string
  count: string
  maxCount?: string
  hasMore: boolean
  startBook: string
  endBook: string
  adress: string
  estimatedCost: string
  material: string
  isActive?: boolean,
  isVerified?: boolean
  mainImage?: string
}

export type AvailableDataType = {
  sizes?: string[]
  prices?: number[]
  colors?: string[]
  materials?: string[]
}

export type ApplicationTypeResponse = {
  applications: Application[]
  availableData: AvailableDataType
}

export type ApplicationTypeParams = {
  name?: string
  size?: string
  type?: string
  take?: number
  skip?: number
  color?: string
  price?: number[]
  subtype?: string
  ownerId?: string
  material?: string
  allProducts?: boolean
  id?: string | string[]
  dealType?: string[]
}
  | undefined

export type ApplicationSliceState = {
  application?: Partial<Application>
}
