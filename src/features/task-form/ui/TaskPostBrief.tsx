import { ExpandLess, ExpandMore, OpenInNew } from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

import {
  formatPlatforms,
  formatPlacementFormats,
  formatPostBudget,
  formatPostBudgetDetails,
  getWorkFormatLabel,
} from '@/entities/post';
import { ROUTES } from '@/shared';

import type { Post } from '@/entities/post';
import type { ReactNode } from 'react';

type DetailItemProps = {
  label?: string;
  children: ReactNode;
};

const DetailItem = ({ label = '', children }: DetailItemProps) => (
  <Box>
    {label && (
      <Typography
        variant="caption"
        sx={{ color: 'info.main', fontWeight: 500, display: 'block', mb: 0.25 }}
      >
        {label}
      </Typography>
    )}
    {typeof children === 'string' ? (
      <Typography
        variant="body2"
        sx={{ whiteSpace: 'pre-wrap' }}
      >
        {children}
      </Typography>
    ) : (
      children
    )}
  </Box>
);

const ChipRow = ({ label, items }: { label: string; items: string[] }) => {
  if (!items.length) return null;

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: 'info.main', fontWeight: 500, display: 'block', mb: 0.75 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexWrap: 'wrap', gap: 0.75 }}
      >
        {items.map(item => (
          <Chip
            key={item}
            size="small"
            label={item}
            sx={{ bgcolor: 'white' }}
          />
        ))}
      </Stack>
    </Box>
  );
};

type TaskPostBriefProps = {
  post: Post;
};

export const TaskPostBrief = ({ post }: TaskPostBriefProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const budgetDetails = formatPostBudgetDetails(post.budget);

  const hasContext =
    Boolean(post.budget) ||
    Boolean(post.workFormat) ||
    Boolean(post.platforms?.length) ||
    Boolean(post.placementFormats?.length) ||
    Boolean(post.tags?.length) ||
    Boolean(post.niche?.length) ||
    Boolean(post.categories?.length);

  if (!hasContext) return null;

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '20px',
        bgcolor: 'secondary.light',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          onClick={handleToggle}
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            minWidth: 0,
            userSelect: 'none',
          }}
        >
          <IconButton
            size="small"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Свернуть условия объявления'
                : 'Развернуть условия объявления'
            }
            onClick={event => {
              event.stopPropagation();
              handleToggle();
            }}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </IconButton>

          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600 }}
          >
            Условия объявления
          </Typography>
        </Stack>

        <Link
          component={RouterLink}
          to={`${ROUTES.POST}/${post.id}`}
          underline="hover"
          variant="caption"
          onClick={event => event.stopPropagation()}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
            ml: 1,
          }}
        >
          {post.title}
          <OpenInNew sx={{ fontSize: 14 }} />
        </Link>
      </Stack>

      <Collapse in={isExpanded}>
        <Stack
          spacing={2}
          sx={{ pt: 2 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {post.budget && (
              <DetailItem label="Бюджет">
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'primary.main' }}
                >
                  {formatPostBudget(post.budget)}
                </Typography>

                {budgetDetails.length > 1 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {budgetDetails
                      .filter(item => item.label !== 'Сумма')
                      .map(item => `${item.label}: ${item.value}`)
                      .join(' · ')}
                  </Typography>
                )}
              </DetailItem>
            )}

            {post.workFormat && (
              <DetailItem label="Формат работы">
                {getWorkFormatLabel(post.workFormat)}
              </DetailItem>
            )}

            {post.platforms?.length ? (
              <DetailItem label="Площадки">
                {formatPlatforms(post.platforms)}
              </DetailItem>
            ) : null}

            {post.placementFormats?.length ? (
              <DetailItem label="Форматы размещения">
                {formatPlacementFormats(post.placementFormats)}
              </DetailItem>
            ) : null}
          </Box>

          <ChipRow
            label="Категории"
            items={post.categories ?? []}
          />
          <ChipRow
            label="Ниша"
            items={post.niche ?? []}
          />
          <ChipRow
            label="Теги"
            items={post.tags ?? []}
          />
        </Stack>
      </Collapse>
    </Box>
  );
};
