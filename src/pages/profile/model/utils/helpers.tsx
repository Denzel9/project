import {
  PhoneOutlined,
  Instagram,
  Telegram,
  WhatsApp,
  YouTube,
  Web,
  OtherHouses,
} from '@mui/icons-material';

import { ContactType } from '@/entities/user';

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
    case ContactType.WEBSITE:
      return value;
    case ContactType.OTHER:
      return value;
    default:
      return '';
  }
};
