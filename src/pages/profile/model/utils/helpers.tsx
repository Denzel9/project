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

import type { ProfileSchemaType } from '../schema/schema';

// const getPhone = (phone: string) => {
//   if (!phone) return '';
//   return phone.startsWith('+7')
//     ? phone.split(' ').join('')
//     : '+7' + phone.split(' ').join('');
// };

// const getContacts = (contacts: Contacts) => {
//   return Object.entries(contacts)
//     .map(([key, value]) => {
//       return {
//         label: key,
//         value: value,
//         type: key,
//       };
//     })
//     .filter(contact => contact.value);
// };

export const parseRequestData = (data: ProfileSchemaType) =>
  Object.fromEntries(
    Object.entries({
      bio: data.bio,
      avatar: data.avatar,
      banner: data.banner,
      aboutMe: data.aboutMe,
      location: data.location,
      contacts: data.contacts,
    }).filter(field => field[1])
  );

export const getMaskedPhone = (p?: string) =>
  p
    ? `${p[0]}${p[1]} ${p[2]}${p[3]}${p[4]} ${p[5]}${p[6]}${p[7]} ${p[8]}${p[9]} ${p[10]}${p[11]}`
    : '';

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
