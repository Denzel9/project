import type { AuthSessionUser, PrimeStatus } from '../types/types'

export const mapAuthSessionUser = (
  user: Partial<AuthSessionUser> & {
    id: string
    accountId: string
    role: string
    membershipRole: string
  },
): AuthSessionUser => ({
  id: user.id,
  accountId: user.accountId,
  role: user.role,
  membershipRole: user.membershipRole,
  isVerified: user.isVerified,
  isEmailConfirmed: Boolean(user.isEmailConfirmed),
  isPrime: Boolean(user.isPrime),
  primeStatus: (user.primeStatus ?? 'NONE') as PrimeStatus,
  primeExpiresAt: user.primeExpiresAt ?? null,
})
