import type { PartnersTabId } from "./types";

export const PARTNERS_TABLE_PAGE_SIZE = 20;

export const EMPTY_MESSAGES: Record<PartnersTabId, string> = {
    executors: 'Пока нет исполнителей',
    applicants: 'Пока нет кандидатов',
    customers: 'Пока нет заказчиков',
    companies: 'Пока нет компаний по вашим откликам',
};

export const CONTACT_LABELS: Partial<Record<PartnersTabId, string>> = {
    executors: 'Исполнитель',
    applicants: 'Кандидат',
    customers: 'Заказчик',
};

export const USER_SEARCH_MIN = 2;
export const USER_SEARCH_LIMIT = 20;