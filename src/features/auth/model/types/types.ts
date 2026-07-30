export type PrimeStatus = 'NONE' | 'ACTIVE' | 'EXPIRED' | 'CANCELED'

export type AuthSessionUser = {
  id: string
  role: string
  membershipRole: string
  isVerified?: boolean
  isEmailConfirmed?: boolean
  isPrime: boolean
  primeStatus: PrimeStatus
  primeExpiresAt: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegistrationCompanyRequest = {
  companyName: string
  email: string
  password: string
}
export type RegistrationCreatorRequest = {
  name: string
  lastName: string
  email: string
  password: string
}

export type RecoveryPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  newPassword: string
  token: string
}

export type AuthResponse = {
  user: AuthSessionUser
}

export type AuthSliceState = {
  id: string | null
  role: string | null
  membershipRole: string | null
  isPrime: boolean
  primeStatus: PrimeStatus | null
  primeExpiresAt: string | null
  isEmailConfirmed: boolean
  isAuth: boolean
  isAuthModalOpen: boolean
  setAuth: (user: AuthSessionUser) => void
  removeAuth: () => void
  setAuthModalOpen: (isOpen: boolean) => void
}
