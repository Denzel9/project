import { Box } from '@mui/material'

import { ExternalLinkAnchor } from './ExternalLinkAnchor'

import type { ReactNode } from 'react'

const URL = /(?:https?:\/\/|www\.)[^\s<>"']+/gi
const TRAILING_PUNCTUATION_RE = /[.,;:!?)]+$/

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const trimUrl = (raw: string) => {
  const match = raw.match(TRAILING_PUNCTUATION_RE)
  if (!match) {
    return { url: raw, trailing: '' }
  }

  return {
    url: raw.slice(0, -match[0].length),
    trailing: match[0],
  }
}

const renderHighlightedPlain = (text: string, highlight?: string) => {
  const trimmedHighlight = highlight?.trim()

  if (!trimmedHighlight) {
    return text
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi'),
  )

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedHighlight.toLowerCase() ? (
      <Box
        key={`${part}-${index}`}
        component="mark"
        sx={{
          bgcolor: 'warning.light',
          color: 'inherit',
          px: 0.25,
          borderRadius: 0.5,
        }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  )
}

type LinkifiedTextProps = {
  text: string
  highlight?: string
}

export const LinkifiedText = ({ text, highlight }: LinkifiedTextProps) => {
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(URL)) {
    const raw = match[0]
    const start = match.index ?? 0

    if (start > lastIndex) {
      nodes.push(
        <span key={`t-${start}`}>
          {renderHighlightedPlain(text.slice(lastIndex, start), highlight)}
        </span>,
      )
    }

    const { url, trailing } = trimUrl(raw)
    const href = /^www\./i.test(url) ? `https://${url}` : url

    nodes.push(
      <ExternalLinkAnchor
        key={`l-${start}`}
        href={href}
        style={{ overflowWrap: 'anywhere', color: 'inherit' }}
      >
        {url}
      </ExternalLinkAnchor>,
    )

    if (trailing) {
      nodes.push(<span key={`p-${start}`}>{trailing}</span>)
    }

    lastIndex = start + raw.length
  }

  if (lastIndex < text.length) {
    nodes.push(
      <span key="t-end">
        {renderHighlightedPlain(text.slice(lastIndex), highlight)}
      </span>,
    )
  }

  return nodes.length > 0 ? <>{nodes}</> : <>{renderHighlightedPlain(text, highlight)}</>
}
