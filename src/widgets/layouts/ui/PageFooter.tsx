import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import { Link as RouterLink } from 'react-router';

import { ROUTES } from '@/shared';

import logo from '../../../../public/Primary.png';

import type { SvgIconProps } from '@mui/material/SvgIcon';

const BRAND = {
  name: 'Nikssens',
  tagline:
    'Платформа, где бренды находят исполнителей и ведут работу от объявления до результата',
} as const;

const NAV_LINKS = [
  { label: 'Главная', path: ROUTES.CRM },
  { label: 'Мои задачи', path: ROUTES.MY_TASKS },
  { label: 'Публикации', path: ROUTES.PUBLICATIONS },
  { label: 'Избранное', path: ROUTES.FAVORITES },
  { label: 'Настройки', path: ROUTES.SETTINGS },
  { label: 'Профиль', path: ROUTES.PROFILE },
] as const;

const LEGAL_LINKS = [
  {
    label: 'Политика конфиденциальности',
    path: ROUTES.PRIVACY_POLICY,
  },
  {
    label: 'Пользовательское соглашение',
    path: ROUTES.USER_AGREEMENT,
  },
] as const;

const CONTACT_ITEMS = [
  {
    label: 'Email',
    value: 'hello@nikssens.com',
    href: 'mailto:hello@nikssens.com',
  },
  {
    label: 'Телефон',
    value: '+7 (999) 000-00-00',
    href: 'tel:+79990000000',
  },
] as const;

const SOCIAL_LINKS = [
  {
    id: 'telegram' as const,
    label: 'Telegram',
    href: 'https://t.me/nikssens',
  },
  {
    id: 'vk' as const,
    label: 'VK',
    href: 'https://vk.com/nikssens',
  },
  {
    id: 'instagram' as const,
    label: 'Instagram',
    href: 'https://instagram.com/nikssens',
  },
  {
    id: 'youtube' as const,
    label: 'YouTube',
    href: 'https://youtube.com/@nikssens',
  },
];

const footerLinkSx = {
  fontSize: 15,
  color: 'info.main',
  '&:hover': { color: 'primary.main' },
} as const;

const TelegramIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    viewBox="0 0 24 24"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </SvgIcon>
);

const VkIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    viewBox="0 0 24 24"
  >
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.305-.491.745-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.745-.576.745z" />
  </SvgIcon>
);

const InstagramIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    viewBox="0 0 24 24"
  >
    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </SvgIcon>
);

const YoutubeIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    viewBox="0 0 24 24"
  >
    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
  </SvgIcon>
);

const socialIcons = {
  telegram: TelegramIcon,
  vk: VkIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
} as const;

export const PageFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'common.white',
        color: 'text.primary',
        p: 4,
        borderBottomLeftRadius: { xs: '16px', md: '32px' },
        borderTopLeftRadius: { xs: '16px', md: '32px' },
        borderTopRightRadius: { xs: '16px', md: '32px' },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 4, md: 6 }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-start' },
          mb: { xs: 4, md: 6 },
        }}
      >
        <Stack
          spacing={2}
          sx={{ maxWidth: 320 }}
        >
          <Box
            component={RouterLink}
            to={ROUTES.CRM}
            sx={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}
          >
            <Box
              component="img"
              src={logo}
              alt="NIKSSENS"
              sx={{ width: 180, height: 40, objectFit: 'contain' }}
            />
          </Box>

          <Typography
            sx={{ color: 'info.main', fontSize: 15, lineHeight: 1.7 }}
          >
            {BRAND.tagline}
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ pt: 0.5 }}
          >
            {SOCIAL_LINKS.map(social => {
              const Icon = socialIcons[social.id];

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
          {NAV_LINKS.map(link => (
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
          {LEGAL_LINKS.map(link => (
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
          {CONTACT_ITEMS.map(item => (
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
          © {year} {BRAND.name}. Все права защищены.
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
