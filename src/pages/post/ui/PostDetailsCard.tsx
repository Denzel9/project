import {
  AccessTimeOutlined,
  LayersOutlined,
  Whatshot,
} from '@mui/icons-material';
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
  formatPostLocation,
  formatBloggerRequirements,
  formatCooperationDetails,
  getPlacementFormatLabel,
  getPlatformLabel,
  getPostTypeLabel,
  getWorkFormatLabel,
  type Post,
  type PostDeliverable,
} from '@/entities';

import { getYandexMapsUrl } from '@/shared/lib/maps/openYandexMaps';

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

const DeliverableItem = ({ item }: { item: PostDeliverable }) => {
  const countLabel = item.count === 1 ? '1 шт.' : `${item.count} шт.`;

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        borderRadius: '16px',
        bgcolor: 'secondary.light',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
      >
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={getPlatformLabel(item.platform)}
          sx={{ fontWeight: 600 }}
        />
        <Chip
          size="small"
          label={getPlacementFormatLabel(item.format)}
          sx={{ bgcolor: 'white' }}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', color: 'text.secondary', mt: 'auto' }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center' }}
        >
          <LayersOutlined sx={{ fontSize: 16 }} />
          <Typography variant="caption">{countLabel}</Typography>
        </Stack>

        {item.durationSec != null && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center' }}
          >
            <AccessTimeOutlined sx={{ fontSize: 16 }} />
            <Typography variant="caption">{item.durationSec} сек.</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

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
  isCompanyPost?: boolean;
};

export const PostDetailsCard = ({
  post,
  isCompanyPost = false,
}: PostDetailsCardProps) => {
  const price = formatPostBudget(post.budget);
  const budgetDetails = formatPostBudgetDetails(post.budget);
  const briefItems = formatPostBrief(post.brief);
  const locationLabel = formatPostLocation(post.location);
  const bloggerRequirements = formatBloggerRequirements(
    post.bloggerRequirements
  );
  const cooperationDetails = formatCooperationDetails(post.cooperationDetails);

  return (
    <Stack
      spacing={2}
      sx={{ width: '100%' }}
      direction={isCompanyPost ? 'column' : 'row'}
    >
      {isCompanyPost && (
        <DetailSection
          title="Детали объявления"
          sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
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
            <DetailRow label="Локация">
              {locationLabel !== '—' ? (
                <Link
                  href={getYandexMapsUrl(locationLabel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="inherit"
                >
                  {locationLabel}
                </Link>
              ) : (
                locationLabel
              )}
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
      )}

      <DetailSection
        title="Контент и площадки"
        sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
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
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 1.25,
                }}
              >
                {post.deliverables.map((item, index) => (
                  <DeliverableItem
                    key={`${item.platform}-${item.format}-${index}`}
                    item={item}
                  />
                ))}
              </Box>
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

      {bloggerRequirements.length > 0 && isCompanyPost && (
        <DetailSection
          title="Требования к блогеру"
          sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
        >
          <ListBlock items={bloggerRequirements} />
        </DetailSection>
      )}

      {cooperationDetails.length > 0 && isCompanyPost && (
        <DetailSection
          title="Условия сотрудничества"
          sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
        >
          <ListBlock items={cooperationDetails} />
        </DetailSection>
      )}

      {briefItems.length > 0 && isCompanyPost && (
        <DetailSection
          title="Бриф"
          sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
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
        sx={{ bgcolor: 'white', borderRadius: '32px', width: '100%' }}
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
