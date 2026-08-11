import {
  AccessTimeOutlined,
  LayersOutlined,
  Whatshot,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  Link,
  Stack,
  Typography,
  type SxProps,
} from '@mui/material'
import { format } from 'date-fns'

import {
  formatPlacementFormats,
  formatPostBrief,
  formatPostBudget,
  formatPostBudgetDetails,
  formatPostLocation,
  formatBloggerRequirements,
  formatCooperationDetails,
  getPlacementFormatLabel,
  getPlatformChipSx,
  getPlatformLabel,
  getWorkFormatLabel,
  getEmploymentTypeLabel,
  type Platform,
  type Post,
  type PostDeliverable,
} from '@/entities'

import type { ReactNode } from 'react'

type DetailRowProps = {
  label: string
  children: ReactNode
  highlight?: boolean
  fullWidth?: boolean
}

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
)

type DetailSectionProps = {
  title: string
  children: ReactNode
  sx?: SxProps
}

const sectionSx = {
  p: { xs: 2, md: 3 },
  borderRadius: '32px',
  bgcolor: 'white',
  border: '1px solid',
  borderColor: 'divider',
  width: '100%',
} as const

const DetailSection = ({ title, children, sx }: DetailSectionProps) => (
  <Box sx={{ ...sectionSx, ...sx }}>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 2 }}
    >
      {title}
    </Typography>
    {children}
  </Box>
)

type ChipSectionProps = {
  title: string
  items: string[]
}

const ChipSection = ({ title, items }: ChipSectionProps) => {
  if (!items.length) return null

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
  )
}

const DeliverableItem = ({ item }: { item: PostDeliverable }) => {
  const countLabel = item.count === 1 ? '1 шт.' : `${item.count} шт.`

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
  )
}

const ListBlock = ({ items }: { items: string[] }) => {
  if (!items.length) return null

  return (
    <Stack spacing={1}>
      {items.map(item => (
        <Typography
          key={item}
          variant="body2"
        >
          · {item}
        </Typography>
      ))}
    </Stack>
  )
}

const LocationValue = ({ locationLabel }: { locationLabel: string }) => {
  if (locationLabel === '—') {
    return <Typography variant="body1">{locationLabel}</Typography>
  }

  return (
    <Typography variant="body1">{locationLabel}</Typography>
  )
}

const TagsSection = ({ post }: { post: Post }) => {
  const hasTags =
    Boolean(post.chips?.length) ||
    Boolean(post.categories?.length) ||
    Boolean(post.tags?.length) ||
    Boolean(post.niche?.length) ||
    Boolean(post.keyWords?.length)

  if (!hasTags) return null

  return (
    <DetailSection title="Метки и категории">
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
      </Stack>
    </DetailSection>
  )
}

const CompanyDetails = ({ post }: { post: Post }) => {
  const price = formatPostBudget(post.budget)
  const budgetDetails = formatPostBudgetDetails(post.budget)
  const locationLabel = formatPostLocation(post.location)
  const briefItems = formatPostBrief(post.brief)
  const bloggerRequirements = formatBloggerRequirements(
    post.bloggerRequirements,
  )
  const cooperationDetails = formatCooperationDetails(post.cooperationDetails)

  const hasDeliverables = Boolean(post.deliverables?.length)
  const hasPlatforms = Boolean(post.platforms?.length)
  const hasFormats = Boolean(post.placementFormats?.length)
  const hasContent = hasDeliverables || hasPlatforms || hasFormats

  return (
    <>
      <DetailSection title="Детали объявления">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          <DetailRow label="Формат работы">
            {post.workFormat ? getWorkFormatLabel(post.workFormat) : '—'}
          </DetailRow>
          <DetailRow label="Тип занятости">
            {post.employmentType
              ? getEmploymentTypeLabel(post.employmentType)
              : '—'}
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
            <LocationValue locationLabel={locationLabel} />
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

      {hasContent && (
        <DetailSection title="Контент и площадки">
          <Stack spacing={2}>
            {hasDeliverables && (
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
                  {post.deliverables?.map((item, index) => (
                    <DeliverableItem
                      key={`${item.platform}-${item.format}-${index}`}
                      item={item}
                    />
                  ))}
                </Box>
              </Stack>
            )}

            {(hasPlatforms || hasFormats) && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {hasPlatforms && (
                  <DetailRow label="Площадки">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {post.platforms?.map(platform => (
                        <Chip
                          key={platform}
                          size="small"
                          variant="outlined"
                          label={getPlatformLabel(platform)}
                          sx={getPlatformChipSx(platform)}
                        />
                      ))}
                    </Box>
                  </DetailRow>
                )}
                {hasFormats && (
                  <DetailRow label="Форматы">
                    {formatPlacementFormats(post.placementFormats)}
                  </DetailRow>
                )}
              </Box>
            )}
          </Stack>
        </DetailSection>
      )}

      {bloggerRequirements.length > 0 && (
        <DetailSection title="Требования к блогеру">
          <ListBlock items={bloggerRequirements} />
        </DetailSection>
      )}

      {cooperationDetails.length > 0 && (
        <DetailSection title="Условия сотрудничества">
          <ListBlock items={cooperationDetails} />
        </DetailSection>
      )}

      {briefItems.length > 0 && (
        <DetailSection title="Бриф">
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

      <TagsSection post={post} />
    </>
  )
}

const CreatorDetails = ({ post }: { post: Post }) => {
  const price = formatPostBudget(post.budget)
  const budgetDetails = formatPostBudgetDetails(post.budget)
  const locationLabel = formatPostLocation(post.location)
  const portfolioLinks = post.brief?.references ?? []
  const platforms = (post.platforms ?? []) as Platform[]

  const hasProfileDetails =
    Boolean(post.workFormat) ||
    Boolean(post.employmentType) ||
    locationLabel !== '—' ||
    price !== '—' ||
    Boolean(post.createdAt)

  return (
    <>
      {hasProfileDetails && (
        <DetailSection title="О исполнителе">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            {post.workFormat && (
              <DetailRow label="Формат работы">
                {getWorkFormatLabel(post.workFormat)}
              </DetailRow>
            )}
            {post.employmentType && (
              <DetailRow label="Тип занятости">
                {getEmploymentTypeLabel(post.employmentType)}
              </DetailRow>
            )}
            {locationLabel !== '—' && (
              <DetailRow label="Локация">
                <LocationValue locationLabel={locationLabel} />
              </DetailRow>
            )}
            {price !== '—' && (
              <DetailRow
                label="Ставка"
                highlight
              >
                {price}
              </DetailRow>
            )}
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

      {platforms.length > 0 && (
        <DetailSection title="Площадки">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {platforms.map(platform => (
              <Chip
                key={platform}
                size="small"
                variant="outlined"
                label={getPlatformLabel(platform)}
                sx={getPlatformChipSx(platform)}
              />
            ))}
          </Box>
        </DetailSection>
      )}

      {portfolioLinks.length > 0 && (
        <DetailSection title="Ссылки">
          <Stack spacing={0.75}>
            {portfolioLinks.map(url => (
              <Link
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                underline="hover"
              >
                {url}
              </Link>
            ))}
          </Stack>
        </DetailSection>
      )}

      <TagsSection post={post} />
    </>
  )
}

type PostDetailsCardProps = {
  post: Post
  isCompanyPost?: boolean
}

export const PostDetailsCard = ({
  post,
  isCompanyPost = false,
}: PostDetailsCardProps) => (
  <Stack
    spacing={1}
    sx={{ width: '100%' }}
    direction="column"
  >
    {isCompanyPost ? (
      <CompanyDetails post={post} />
    ) : (
      <CreatorDetails post={post} />
    )}
  </Stack>
)

export default PostDetailsCard
