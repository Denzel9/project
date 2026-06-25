import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { diffWords } from 'diff';
import { useEffect, useMemo, useRef } from 'react';

import { MarkdownContent } from '@/shared';

type ActivityFieldDiffViewProps = {
  field?: string;
  from: string;
  to: string;
  isOpen?: boolean;
};

const EMPTY_PLACEHOLDER = '—';

const DiffSide = ({
  parts,
  side,
}: {
  side: 'before' | 'after';
  parts: ReturnType<typeof diffWords>;
}) => {
  const filteredParts =
    side === 'before'
      ? parts.filter(part => !part.added)
      : parts.filter(part => !part.removed);

  if (filteredParts.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {EMPTY_PLACEHOLDER}
      </Typography>
    );
  }

  return (
    <Typography
      component="div"
      variant="body2"
      sx={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
      }}
    >
      {filteredParts.map((part, index) => {
        const isChanged = side === 'before' ? part.removed : part.added;

        if (!isChanged) {
          return <span key={index}>{part.value}</span>;
        }

        return (
          <Box
            key={index}
            data-diff-changed
            component="span"
            sx={{
              px: 0.25,
              color: 'black',
              bgcolor: side === 'before' ? 'error.light' : 'success.light',
            }}
          >
            {part.value}
          </Box>
        );
      })}
    </Typography>
  );
};

const MarkdownSide = ({ content }: { content: string }) => {
  if (!content?.trim()) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {EMPTY_PLACEHOLDER}
      </Typography>
    );
  }

  return <MarkdownContent content={content} />;
};

export const ActivityFieldDiffView = ({
  field,
  from,
  to,
  isOpen = false,
}: ActivityFieldDiffViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDescription = field === 'description';
  const parts = useMemo(
    () => (isDescription ? [] : diffWords(from || '', to || '')),
    [from, isDescription, to]
  );

  const hasFrom = Boolean(from?.trim());
  const hasTo = Boolean(to?.trim());

  useEffect(() => {
    if (!isOpen || isDescription) return;

    const timer = window.setTimeout(() => {
      containerRef.current
        ?.querySelector('[data-diff-changed]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isOpen, isDescription, from, to]);

  return (
    <Stack
      ref={containerRef}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ mt: 2, width: '100%' }}
    >
      <Box
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '16px',
          bgcolor: 'secondary.light',
          opacity: hasFrom ? 1 : 0.7,
        }}
      >
        <Chip
          size="small"
          label="Было"
          color="error"
          sx={{ mb: 1.5 }}
        />

        {isDescription ? (
          <MarkdownSide content={from} />
        ) : hasFrom ? (
          <DiffSide
            side="before"
            parts={parts}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {EMPTY_PLACEHOLDER}
          </Typography>
        )}
      </Box>

      <Divider
        orientation="vertical"
        flexItem
      />

      <Box
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '16px',
          bgcolor: 'secondary.light',
          opacity: hasTo ? 1 : 0.7,
        }}
      >
        <Chip
          size="small"
          label="Стало"
          color="success"
          sx={{ mb: 1.5 }}
        />

        {isDescription ? (
          <MarkdownSide content={to} />
        ) : hasTo ? (
          <DiffSide
            side="after"
            parts={parts}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {EMPTY_PLACEHOLDER}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
