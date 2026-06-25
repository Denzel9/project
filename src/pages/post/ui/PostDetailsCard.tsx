import { Whatshot } from '@mui/icons-material';
import {
  Box,
  Chip,
  Link,
  Stack,
  Typography,
  type SxProps,
} from '@mui/material';
import { format } from 'date-fns';

import {
  formatPlatforms,
  formatPlacementFormats,
  formatPostBrief,
  formatPostBudget,
  formatPostBudgetDetails,
  formatPostDeliverable,
  getPostTypeLabel,
  getWorkFormatLabel,
} from '@/entities/post';

import type { Post, PostDeliverable } from '@/entities/post';
import type { ReactNode } from 'react';

type DetailRowProps = {
  label: string;
  children: ReactNode;
  highlight?: boolean;
  fullWidth?: boolean;
};

const DetailRow = ({
  label,
  children,
  highlight = false,
  fullWidth = false,
}: DetailRowProps) => (
  <Box
    sx={{ gridColumn: fullWidth ? { xs: 'span 1', md: 'span 2' } : undefined }}
  >
    <Typography
      variant="caption"
      sx={{ color: 'info.main', display: 'block', mb: 0.5, fontWeight: 500 }}
    >
      {label}
    </Typography>
    {typeof children === 'string' ? (
      <Typography
        variant="body1"
        sx={{
          whiteSpace: 'pre-wrap',
          ...(highlight && { color: 'primary.main', fontWeight: 600 }),
          ...(!highlight && children === '—' && { color: 'text.secondary' }),
        }}
      >
        {children}
      </Typography>
    ) : (
      children
    )}
  </Box>
);

type DetailSectionProps = {
  title: string;
  children: ReactNode;
  sx?: SxProps;
};

const DetailSection = ({ title, children, sx }: DetailSectionProps) => (
  <Box
    sx={{
      p: { xs: 2, md: 4 },
      borderRadius: '20px',
      bgcolor: 'secondary.light',
      ...sx,
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 2 }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

type ChipSectionProps = {
  title: string;
  items: string[];
};

const ChipSection = ({ title, items }: ChipSectionProps) => {
  if (!items.length) return null;

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: 'info.main', display: 'block', mb: 1, fontWeight: 500 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.map(item => (
          <Chip
            key={item}
            label={item}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

const DeliverableItem = ({ item }: { item: PostDeliverable }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: '14px',
      bgcolor: 'white',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="body2"
      sx={{ fontWeight: 600 }}
    >
      {formatPostDeliverable(item)}
    </Typography>
  </Box>
);

const ListBlock = ({ items }: { items: string[] }) => {
  if (!items.length) return null;

  return (
    <Stack spacing={0.75}>
      {items.map(item => (
        <Typography
          key={item}
          variant="body2"
        >
          · {item}
        </Typography>
      ))}
    </Stack>
  );
};

type PostDetailsCardProps = {
  post: Post;
};

export const PostDetailsCard = ({ post }: PostDetailsCardProps) => {
  const price = formatPostBudget(post.budget);
  const budgetDetails = formatPostBudgetDetails(post.budget);
  const briefItems = formatPostBrief(post.brief);

  return (
    <Stack spacing={2}>
      <DetailSection
        title="Детали объявления"
        sx={{ bgcolor: 'white', borderRadius: '32px' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          <DetailRow label="Тип автора">
            {getPostTypeLabel(post.type)}
          </DetailRow>
          <DetailRow label="Формат работы">
            {post.workFormat ? getWorkFormatLabel(post.workFormat) : '—'}
          </DetailRow>
          <DetailRow label="Срочность">
            {post.urgent ? (
              <Chip
                size="small"
                color="error"
                icon={<Whatshot />}
                label="Срочно"
              />
            ) : (
              'Не срочно'
            )}
          </DetailRow>
          <DetailRow
            label="Бюджет"
            highlight={price !== '—'}
          >
            {price}
          </DetailRow>
          <DetailRow label="Дедлайн">
            {post.deadline
              ? format(new Date(post.deadline), 'dd.MM.yyyy')
              : '—'}
          </DetailRow>
          <DetailRow label="Опубликовано">
            {format(new Date(post.createdAt), 'dd.MM.yyyy')}
          </DetailRow>
          <DetailRow label="Обновлено">
            {format(new Date(post.updatedAt), 'dd.MM.yyyy')}
          </DetailRow>
        </Box>

        {budgetDetails.length > 1 && (
          <Box sx={{ mt: 2.5 }}>
            <ListBlock
              items={budgetDetails
                .filter(item => item.label !== 'Сумма')
                .map(item => `${item.label}: ${item.value}`)}
            />
          </Box>
        )}
      </DetailSection>

      <DetailSection
        title="Контент и площадки"
        sx={{ bgcolor: 'white', borderRadius: '32px' }}
      >
        <Stack spacing={2}>
          {post.deliverables?.length ? (
            <Stack spacing={1}>
              <Typography
                variant="caption"
                sx={{ color: 'info.main', fontWeight: 500 }}
              >
                Позиции контента
              </Typography>
              <Stack spacing={1}>
                {post.deliverables.map((item, index) => (
                  <DeliverableItem
                    key={`${item.platform}-${item.format}-${index}`}
                    item={item}
                  />
                ))}
              </Stack>
            </Stack>
          ) : (
            <DetailRow label="Контент">—</DetailRow>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <DetailRow label="Площадки">
              {formatPlatforms(post.platforms)}
            </DetailRow>
            <DetailRow label="Форматы">
              {formatPlacementFormats(post.placementFormats)}
            </DetailRow>
          </Box>
        </Stack>
      </DetailSection>

      {briefItems.length > 0 && (
        <DetailSection
          title="Бриф"
          sx={{ bgcolor: 'white', borderRadius: '32px' }}
        >
          <Stack spacing={2}>
            {briefItems.map(item => (
              <Box key={item.label}>
                <Typography
                  variant="caption"
                  sx={{ color: 'info.main', fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
                {item.label === 'Гайдлайны' ? (
                  <Link
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {item.value}
                  </Link>
                ) : item.label === 'Референсы' ? (
                  <Stack
                    spacing={0.5}
                    sx={{ mt: 0.5 }}
                  >
                    {post.brief?.references?.map(url => (
                      <Link
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                      >
                        {url}
                      </Link>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                  >
                    {item.value}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </DetailSection>
      )}

      <DetailSection
        title="Метки и категории"
        sx={{ bgcolor: 'white', borderRadius: '32px' }}
      >
        <Stack spacing={2}>
          <ChipSection
            title="Преимущества"
            items={post.chips ?? []}
          />
          <ChipSection
            title="Категории"
            items={post.categories ?? []}
          />
          <ChipSection
            title="Теги"
            items={post.tags ?? []}
          />
          <ChipSection
            title="Ниша"
            items={post.niche ?? []}
          />
          <ChipSection
            title="Ключевые слова"
            items={post.keyWords ?? []}
          />
          {!post.chips?.length &&
            !post.categories?.length &&
            !post.tags?.length &&
            !post.niche?.length &&
            !post.keyWords?.length && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Не указано
              </Typography>
            )}
        </Stack>
      </DetailSection>
    </Stack>
  );
};

export default PostDetailsCard;
