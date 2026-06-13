import { ContactType } from "../types";

import type { User } from "../types";

const WEBSITE_URL_REGEX = /^https?:\/\/.+/i;

const looksLikeUrl = (value: string) =>
    /https?:\/\//i.test(value) ||
    /^www\./i.test(value) ||
    /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$)/.test(value.trim());

export const validateWebsiteUrl = (value: string) => WEBSITE_URL_REGEX.test(value);

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

export const getUserName = (user: User) => {
    if (user?.companyProfile) {
        return user?.companyProfile?.companyName;
    }

    return `${user?.creatorProfile?.name} ${user?.creatorProfile?.lastName}`;
};

export const validatePhone = (value: string) => {
    if (!value) return true;

    const newValue = value?.startsWith('+7') ? value : '+7 ' + value;
    const preparedValue = newValue.replaceAll('_', '').split(' ').join('');

    return preparedValue.length === 12;
}

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
            groups.push(d.slice(i, i + 2), d.slice(i + 2, i + 4), d.slice(i + 4, i + 6));
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