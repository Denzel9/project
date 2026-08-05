import {
  getActionActorParts,
  type ActionActorParts,
} from '@/shared/lib/formatActionActorLabel'

import type { Application, ApplicationApplicant, ApplicationStatus } from './types'

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

const toApplicationActorFields = (application: Application) => {
  if (application.lastActorDisplayName || application.lastActorKind) {
    return {
      actorAccountId: application.lastActorAccountId,
      actorDisplayName: application.lastActorDisplayName,
      actorKind: application.lastActorKind,
    }
  }

  return {
    actorAccountId: application.createdActorAccountId,
    actorDisplayName: application.createdActorDisplayName,
    actorKind: application.createdActorKind,
  }
}

/** Кто работал с откликом (сырые поля актёра) */
export const getApplicationActor = (application?: Application | null) => {
  if (!application) return null
  const actor = toApplicationActorFields(application)
  if (!actor.actorDisplayName?.trim() && !actor.actorKind) return null
  return actor
}

/** Кто работал с откликом: kind + имя отдельно */
export const getApplicationActorParts = (
  application?: Application | null,
): ActionActorParts | null => {
  const actor = getApplicationActor(application)
  if (!actor) return null
  return getActionActorParts(actor)
}
