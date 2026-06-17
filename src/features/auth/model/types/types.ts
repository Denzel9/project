
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
  user: { id: string, role: string, membershipRole: string }
}

export type AuthSliceState = {
  id: string | null
  role: string | null
  membershipRole: string | null
  isAuth: boolean
  isAuthModalOpen: boolean
  setAuth: (id: string, role: string, membershipRole: string) => void
  removeAuth: () => void
  setAuthModalOpen: (isOpen: boolean) => void
}
