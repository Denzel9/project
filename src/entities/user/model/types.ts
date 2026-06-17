

export type User = {
  email: string | null;
  person: Person;
  aboutMe: string | null;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  companyProfile: CompanyProfile;
  companyName: string;
  id: string;
  userId: string;
  createdAt: string;
  creatorProfile: CreatorProfile;
  followers: number;
  location: string | null;
  contacts: Contact[];
  phone: string | null;
  role: string;
  updatedAt: string;
};

export type Person = {
  height: string | null;
  weight: string | null;
  size: string | null;
  birthday: string | null;
  gender: string | null;
  parameters: string | null;
};

export type Contacts = { phone: string | null, telegram: string | null, whatsapp: string | null, instagram: string | null, youtube: string | null, vk: string | null, website: string | null, other: string | null }


export type Contact = {
  id?: string;
  label?: string;
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
  EMAIL = 'email',
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
  [ContactType.EMAIL]: 'Email',
}


export type CompanyProfile = {
  companyName: string | null;
  id: string;
  userId: string;
};

export type CreatorProfile = {
  id: string;
  userId: string;
  name: string | null;
  lastName: string | null;
};