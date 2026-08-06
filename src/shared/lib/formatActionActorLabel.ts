export type ActionActorKind = 'OWNER' | 'MANAGER'

export type ActionActorFields = {
  actorAccountId?: string | null
  actorDisplayName?: string | null
  actorKind?: ActionActorKind | null
}

export type ActionActorParts = {
  kindLabel: string
  name: string
}

export const ACTION_ACTOR_KIND_LABELS: Record<ActionActorKind, string> = {
  OWNER: 'Владелец',
  MANAGER: 'Менеджер',
}

export const getActionActorKindLabel = (
  actor?: Pick<ActionActorFields, 'actorKind'> | null,
) => {
  const kind = actor?.actorKind
  if (kind !== 'MANAGER') return ''
  return ACTION_ACTOR_KIND_LABELS.MANAGER
}

export const getActionActorDisplayName = (
  actor?: ActionActorFields | null,
  fallback?: string,
) => {
  const name = actor?.actorDisplayName?.trim()
  if (name) return name
  return fallback?.trim() ?? ''
}

export const getActionActorParts = (
  actor?: ActionActorFields | null,
  fallback?: string,
): ActionActorParts | null => {
  const name = getActionActorDisplayName(actor, fallback)
  const kindLabel = getActionActorKindLabel(actor)

  if (!name && !kindLabel) return null

  return { kindLabel, name }
}

export const formatActionActorLabel = (
  actor?: ActionActorFields | null,
  fallback?: string,
) => {
  const parts = getActionActorParts(actor, fallback)
  if (!parts) return ''

  if (parts.kindLabel && parts.name) {
    return `${parts.kindLabel} · ${parts.name}`
  }

  return parts.name || parts.kindLabel
}
