import type { ApplicationApplicant } from '@/entities/application/model/types'

import type { User } from '../model/types'

export const applicantToUserPartial = (
  applicant?: ApplicationApplicant,
): Partial<User> | undefined => {
  if (!applicant) return undefined

  if (applicant.role === 'COMPANY') {
    return {
      id: applicant.id,
      companyProfile: {
        companyName: applicant.companyName ?? null,
      } as User['companyProfile'],
    }
  }

  return {
    id: applicant.id,
    creatorProfile: {
      name: applicant.name ?? null,
      lastName: applicant.lastName ?? null,
    } as User['creatorProfile'],
  }
}
