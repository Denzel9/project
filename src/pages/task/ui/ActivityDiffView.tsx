import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { diffWords } from 'diff';
import { useEffect, useMemo, useRef } from 'react';

type ActivityDiffViewProps = {
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
              ...(side === 'before'
                ? {
                    color: 'black',
                    bgcolor: 'error.light',
                  }
                : {
                    color: 'black',
                    bgcolor: 'success.light',
                  }),
            }}
          >
            {part.value}
          </Box>
        );
      })}
    </Typography>
  );
};

export const ActivityDiffView = ({
  from,
  to,
  isOpen = false,
}: ActivityDiffViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parts = useMemo(() => diffWords(from || '', to || ''), [from, to]);

  const hasFrom = Boolean(from?.trim());
  const hasTo = Boolean(to?.trim());

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      const changedEl = containerRef.current?.querySelector(
        '[data-diff-changed]'
      );

      changedEl?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isOpen, from, to]);

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
          opacity: hasFrom ? 1 : 0.7,
        }}
      >
        <Chip
          size="small"
          label="Было"
          color="error"
          sx={{ mb: 1.5 }}
        />

        {hasFrom ? (
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
          opacity: hasTo ? 1 : 0.7,
        }}
      >
        <Chip
          size="small"
          label="Стало"
          color="success"
          sx={{ mb: 1.5 }}
        />

        {hasTo ? (
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

export default ActivityDiffView;
