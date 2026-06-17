import {
  PhoneOutlined,
  Instagram,
  Telegram,
  WhatsApp,
  YouTube,
  Web,
  OtherHouses,
  EmailOutlined,
} from '@mui/icons-material';

import { ContactType } from '../types';

import type { User } from '../types';

const WEBSITE_URL_REGEX = /^https?:\/\/.+/i;

const looksLikeUrl = (value: string) =>
  /https?:\/\//i.test(value) ||
  /^www\./i.test(value) ||
  /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$)/.test(value.trim());

export const validateWebsiteUrl = (value: string) =>
  WEBSITE_URL_REGEX.test(value);

export const validateContactValue = (
  value: string | undefined,
  type: ContactType
) => {
  if (!value) return false;

  switch (type) {
    case ContactType.PHONE:
      return validatePhone(value);
    case ContactType.WEBSITE:
      return validateWebsiteUrl(value);
    default:
      return !looksLikeUrl(value);
  }
};

// TODO: Refactor user: Partial<User> | undefined
export const getUserName = (user: Partial<User> | undefined) => {
  if (!user) return '';

  if (Object.keys(user?.companyProfile ?? {}).length) {
    return user?.companyProfile?.companyName;
  }

  return `${user?.creatorProfile?.name} ${user?.creatorProfile?.lastName}`;
};

export const validatePhone = (value: string | undefined) => {
  if (!value) return true;

  const newValue = value?.startsWith('+7') ? value : '+7 ' + value;
  const preparedValue = newValue.replaceAll('_', '').split(' ').join('');

  return preparedValue.length === 12;
};

export const getPhone = (phone: string) => {
  if (!phone || phone === '+7 ') return null;

  return phone?.startsWith('+7') ? phone : '+7 ' + phone;
};

export const PARAMETERS_REGEX = /^\d{2,3}\/\d{2,3}\/\d{2,3}$/;

export const validateParameters = (value?: string | null) => {
  if (!value) return true;

  return PARAMETERS_REGEX.test(value);
};

const formatDigitsOnly = (digits: string): string => {
  const d = digits.slice(0, 9);
  const groups: string[] = [];
  let i = 0;

  while (i < d.length && groups.length < 3) {
    const remaining = d.length - i;
    const slotsLeft = 3 - groups.length;

    if (slotsLeft === 1) {
      groups.push(d.slice(i, i + Math.min(3, remaining)));
      break;
    }

    if (remaining === 6 && slotsLeft === 3) {
      groups.push(
        d.slice(i, i + 2),
        d.slice(i + 2, i + 4),
        d.slice(i + 4, i + 6)
      );
      return groups.join('/');
    }

    let take = Math.min(3, remaining);

    if (remaining - take === 1) {
      take = Math.min(2, remaining);
    }

    groups.push(d.slice(i, i + take));
    i += take;
  }

  return groups.join('/');
};

export const formatParametersValue = (input: string): string => {
  const endsWithSlash = input.endsWith('/');
  const cleaned = input.replace(/[^\d/]/g, '').replace(/\/+/g, '/');

  if (!cleaned.includes('/')) {
    return formatDigitsOnly(cleaned);
  }

  const groups: string[] = [];

  for (const segment of cleaned.split('/')) {
    let digits = segment;

    while (digits.length > 0 && groups.length < 3) {
      if (digits.length <= 3) {
        groups.push(digits);
        digits = '';
      } else {
        groups.push(digits.slice(0, 3));
        digits = digits.slice(3);
      }
    }

    if (groups.length >= 3) break;
  }

  let result = groups.join('/');

  if (
    endsWithSlash &&
    groups.length < 3 &&
    groups[groups.length - 1]?.length >= 2 &&
    !result.endsWith('/')
  ) {
    result += '/';
  }

  return result;
};

export const getContactIcon = (type: ContactType) => {
  switch (type) {
    case ContactType.PHONE:
      return <PhoneOutlined />;
    case ContactType.INSTAGRAM:
      return <Instagram />;
    case ContactType.TELEGRAM:
      return <Telegram />;
    case ContactType.WHATSAPP:
      return <WhatsApp />;
    case ContactType.YOUTUBE:
      return <YouTube />;
    case ContactType.VK:
      return 'VK';
    case ContactType.EMAIL:
      return <EmailOutlined />;
    case ContactType.WEBSITE:
      return <Web />;
    case ContactType.OTHER:
      return <OtherHouses />;
    default:
      return null;
  }
};

export const getContactLink = (type: ContactType, value: string) => {
  switch (type) {
    case ContactType.PHONE:
      return `tel:${value}`;
    case ContactType.INSTAGRAM:
      return `https://www.instagram.com/${value}`;
    case ContactType.TELEGRAM:
      return `https://t.me/${value}`;
    case ContactType.WHATSAPP:
      return `https://wa.me/${value}`;
    case ContactType.YOUTUBE:
      return `https://www.youtube.com/channel/${value}`;
    case ContactType.VK:
      return `https://vk.com/${value}`;
    case ContactType.EMAIL:
      return `mailto:${value}`;
    case ContactType.WEBSITE:
      return value;
    case ContactType.OTHER:
      return value;
    default:
      return '';
  }
};
