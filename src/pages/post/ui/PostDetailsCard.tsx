import { Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

import {
  formatPostContentCount,
  formatPostPrice,
  getContentTypeLabel,
  getCooperationTypesLabel,
  getPostTypeLabel,
} from '@/entities/post';

import type { Post } from '@/entities/post';
import type { ReactNode } from 'react';

type DetailRowProps = {
  label: string;
  children: ReactNode;
  highlight?: boolean;
};

const DetailRow = ({ label, children, highlight = false }: DetailRowProps) => (
  <Box>
    <Typography
      variant="caption"
      sx={{ color: 'info.main', display: 'block', mb: 0.5 }}
    >
      {label}
    </Typography>
    {typeof children === 'string' ? (
      <Typography
        variant="body1"
        sx={{
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

type ChipSectionProps = {
  title: string;
  items: string[];
};

const ChipSection = ({ title, items }: ChipSectionProps) => {
  if (!items.length) return null;

  return (
    <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
      <Typography
        variant="caption"
        sx={{ color: 'info.main', display: 'block', mb: 1 }}
      >
        {title}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {items.map(item => (
          <Chip
            key={item}
            label={item}
            size="small"
          />
        ))}
      </Stack>
    </Box>
  );
};

type PostDetailsCardProps = {
  post: Post;
};

export const PostDetailsCard = ({ post }: PostDetailsCardProps) => {
  const price = formatPostPrice(post.finalPrice, post.rangePrice);
  const contentCount = formatPostContentCount(post);

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        bgcolor: 'white',
        borderRadius: { xs: '16px', md: '32px' },
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mb: 3 }}
      >
        Детали заявки
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <DetailRow label="Тип автора">{getPostTypeLabel(post.type)}</DetailRow>

        <DetailRow label="Сотрудничество">
          {getCooperationTypesLabel(post.typeCooperation)}
        </DetailRow>

        <DetailRow label="Тип контента">
          {getContentTypeLabel(post.contentType)}
        </DetailRow>

        <DetailRow label="Количество контента">{contentCount}</DetailRow>

        <DetailRow
          label="Бюджет"
          highlight={price !== '—'}
        >
          {price}
        </DetailRow>

        <DetailRow label="Дата публикации">
          {format(new Date(post.createdAt), 'dd.MM.yyyy')}
        </DetailRow>

        <ChipSection
          title="Категории"
          items={post.categories ?? []}
        />

        <ChipSection
          title="Ключевые слова"
          items={post.keyWords ?? []}
        />
      </Box>
    </Box>
  );
};

export default PostDetailsCard;
