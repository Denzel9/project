import { getPhone, type Contact, type User } from "@/entities/user";

import type { AccountSchemaFormType } from "../schema/accountSchema";

export const parseRequestCreatorData = (data: AccountSchemaFormType, user: User) => {
    console.log({ data });

    return {
        creatorProfile: {
            ...user?.creatorProfile,
            name: data.name,
            lastName: data.lastName,
        },
        person: {
            height: data.height || null,
            weight: data.weight || null,
            size: data.size || null,
            birthday: data.birthday || null,
            gender: data.gender || null,
            parameters: data.parameters || null,
        },
        contacts: data.contacts as Contact[],
        bio: data.bio || null,
        location: data.location || null,
        phone: getPhone(data.phone) || null,
        avatar: data.avatar || null,
        banner: data.banner || null,
        companyProfile: {
            ...user?.companyProfile,
            companyName: data.companyName || user?.companyProfile?.companyName || null,
        },
        aboutMe: data.aboutMe || null,

    };
};