
export type User = {
  aboutMe: string;
  avatar: string;
  banner: string;
  bio: string;
  companyProfile: CompanyProfile;
  companyName: string;
  id: string;
  userId: string;
  createdAt: string;
  creatorProfile: CreatorProfile;
  followers: number;
  location: string;
  contacts: Contact[];
  phone: string;
  role: string;
  updatedAt: string;
};

export type Contacts = { phone: string, telegram: string, whatsapp: string, instagram: string, youtube: string, vk: string, website: string, other: string }


export type Contact = {
  id?: string;
  label: string;
  type: ContactType;
  value: string;
};

export enum ContactType {
  PHONE = 'phone',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  VK = 'vk',
  WEBSITE = 'website',
  OTHER = 'other',
}

export const CONTACT_LABELS = {
  [ContactType.PHONE]: 'Телефон',
  [ContactType.TELEGRAM]: 'Telegram',
  [ContactType.WHATSAPP]: 'WhatsApp',
  [ContactType.INSTAGRAM]: 'Instagram',
  [ContactType.YOUTUBE]: 'YouTube',
  [ContactType.VK]: 'VK',
  [ContactType.WEBSITE]: 'Website',
  [ContactType.OTHER]: 'Другое',
}


export type CompanyProfile = {
  companyName: string;
  id: string;
  userId: string;
};

export type CreatorProfile = {
  id: string;
  userId: string;
  name: string;
  lastName: string;
};