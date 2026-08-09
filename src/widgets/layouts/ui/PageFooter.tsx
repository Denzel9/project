import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { ROUTES } from '@/shared';

import {
  FOOTER_BRAND,
  FOOTER_CONTACT_ITEMS,
  FOOTER_LEGAL_LINKS,
  FOOTER_NAV_LINKS,
  FOOTER_SOCIAL_LINKS,
  footerLinkSx,
} from '../model/footer';
import { footerSocialIcons } from '../model/socialIcons';

export const PageFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        p: 2,
        py: 4,
        flexShrink: 0,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'common.white',
        color: 'text.primary',
        borderBottomLeftRadius: { xs: '16px', md: '24px' },
        borderTopLeftRadius: { xs: '16px', md: '24px' },
        borderTopRightRadius: { xs: '16px', md: '24px' },
      }}
    >
      <Stack
        spacing={{ xs: 4, md: 6 }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 4, md: 6 },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-start' },
        }}
      >
        <Stack
          spacing={2}
          sx={{ maxWidth: 320 }}
        >
          <Box
            to={ROUTES.CRM}
            component={RouterLink}
            sx={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}
          >
            <Box
              alt="NIKSSENS"
              component="img"
              src={'/Primary.png'}
              sx={{ width: 180, height: 40, objectFit: 'contain' }}
            />
          </Box>

          <Typography
            sx={{ color: 'info.main', fontSize: 15, lineHeight: 1.7 }}
          >
            {FOOTER_BRAND.tagline}
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ pt: 0.5 }}
          >
            {FOOTER_SOCIAL_LINKS.map(social => {
              const Icon = footerSocialIcons[social.id];

              return (
                <IconButton
                  key={social.id}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: 'info.main',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', lineHeight: 0 }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                </IconButton>
              );
            })}
          </Stack>
        </Stack>

        <Stack
          spacing={1.5}
          sx={{ minWidth: 140 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
            Навигация
          </Typography>
          {FOOTER_NAV_LINKS.map(link => (
            <Link
              key={link.path}
              component={RouterLink}
              to={link.path}
              underline="none"
              sx={footerLinkSx}
            >
              {link.label}
            </Link>
          ))}
        </Stack>

        <Stack
          spacing={1.5}
          sx={{ minWidth: 200, maxWidth: 280 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
            Документы
          </Typography>
          {FOOTER_LEGAL_LINKS.map(link => (
            <Link
              key={link.path}
              component={RouterLink}
              to={link.path}
              underline="none"
              sx={footerLinkSx}
            >
              {link.label}
            </Link>
          ))}
        </Stack>

        <Stack
          spacing={1.5}
          sx={{ minWidth: 180 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
            Контакты
          </Typography>
          {FOOTER_CONTACT_ITEMS.map(item => (
            <Box key={item.label}>
              <Typography
                sx={{ color: 'info.main', fontSize: 13, mb: 0.25 }}
              >
                {item.label}
              </Typography>
              <Link
                href={item.href}
                underline="none"
                sx={{
                  color: 'text.primary',
                  fontSize: 15,
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item.value}
              </Link>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Divider sx={{ borderColor: 'divider', mb: 3 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography sx={{ color: 'info.main', fontSize: 13 }}>
          © {year} {FOOTER_BRAND.name}. Все права защищены.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2.5 }}
          sx={{ flexWrap: 'wrap' }}
        >
          <Link
            component={RouterLink}
            to={ROUTES.PRIVACY_POLICY}
            underline="none"
            sx={{
              fontSize: 13,
              color: 'info.main',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Конфиденциальность
          </Link>
          <Link
            component={RouterLink}
            to={ROUTES.USER_AGREEMENT}
            underline="none"
            sx={{
              fontSize: 13,
              color: 'info.main',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Соглашение
          </Link>
          <Link
            href="mailto:hello@nikssens.com"
            underline="none"
            sx={{
              fontSize: 13,
              color: 'info.main',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Связаться с нами
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PageFooter;
