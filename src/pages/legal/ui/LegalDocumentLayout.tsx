import { ArrowBack } from '@mui/icons-material'
import { Box, IconButton, Link, Stack, Typography } from '@mui/material'
import { type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'

import { BASE_COLOR } from '@/app/index'
import { ROUTES } from '@/shared'

type LegalDocumentLayoutProps = {
  title: string
  updatedAt: string
  children: ReactNode
}

export const LegalDocumentLayout = ({
  title,
  updatedAt,
  children,
}: LegalDocumentLayoutProps) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: `linear-gradient(165deg, #f7faf9 0%, #eef5f4 42%, #e8f0ef 100%)`,
    }}
  >
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'rgba(77, 144, 142, 0.18)',
        bgcolor: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center' }}
      >
        <IconButton
          component={RouterLink}
          to={ROUTES.AUTH}
          aria-label="Назад"
          size="small"
        >
          <ArrowBack />
        </IconButton>

        <Link
          component={RouterLink}
          to={ROUTES.AUTH}
          underline="none"
          color="inherit"
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: '0.04em' }}
          >
            NIKS
            <Box
              component="span"
              sx={{ color: BASE_COLOR }}
            >
              SENSES
            </Box>
          </Typography>
        </Link>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
      >
        <Link
          component={RouterLink}
          to={ROUTES.USER_AGREEMENT}
          underline="hover"
          color="text.secondary"
          variant="body2"
        >
          Соглашение
        </Link>
        <Link
          component={RouterLink}
          to={ROUTES.PRIVACY_POLICY}
          underline="hover"
          color="text.secondary"
          variant="body2"
        >
          Конфиденциальность
        </Link>
      </Stack>
    </Box>

    <Box
      sx={{
        flex: 1,
        width: '100%',
        maxWidth: 820,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', md: '2.25rem' },
          letterSpacing: '-0.02em',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Последнее обновление: {updatedAt}
      </Typography>

      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: '28px',
          border: '1px solid',
          borderColor: 'rgba(77, 144, 142, 0.16)',
          p: { xs: 2.5, md: 4 },
          '& h2': {
            fontSize: '1.15rem',
            fontWeight: 700,
            mt: 3.5,
            mb: 1.25,
          },
          '& h2:first-of-type': {
            mt: 0,
          },
          '& p': {
            color: 'text.secondary',
            lineHeight: 1.7,
            mb: 1.5,
          },
          '& ul': {
            pl: 2.5,
            mb: 1.5,
            color: 'text.secondary',
            lineHeight: 1.7,
          },
          '& li': {
            mb: 0.75,
          },
        }}
      >
        {children}
      </Box>
    </Box>

    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 2,
        borderTop: '1px solid',
        borderColor: 'rgba(77, 144, 142, 0.12)',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        NIKS
        <Box
          component="span"
          sx={{ color: BASE_COLOR }}
        >
          SENSES
        </Box>{' '}
        © 2026
      </Typography>
    </Box>
  </Box>
)
