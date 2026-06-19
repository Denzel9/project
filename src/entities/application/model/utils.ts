import type { ApplicationApplicant, ApplicationStatus } from './types'

export enum APPLICATION_STATUS_ENUM {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  NEW: 'Новый',
  VIEWED: 'Просмотрен',
  ACCEPTED: 'Принят',
  REJECTED: 'Отклонён',
  WITHDRAWN: 'Отозван',
}

export const getApplicantName = (applicant?: ApplicationApplicant) => {
  if (!applicant) return 'Пользователь'

  if (applicant.role === 'COMPANY') {
    return applicant.companyName ?? 'Компания'
  }

  return [applicant.name, applicant.lastName].filter(Boolean).join(' ')
}


