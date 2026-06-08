import { useCallback, useEffect } from "react";

import { type User } from "@/entities/user";

import { PROFILE_SCHEMA_KEYS, type ProfileSchemaType } from "../schema/schema";
import { useProfileStore } from "../store";
import { getMaskedPhone } from "../utils/helpers";

import type { UseFormSetValue } from "react-hook-form";

type UseSetValueProps = {
    id: string;
    user: User | null;
    setValue: UseFormSetValue<ProfileSchemaType>;
}

export const useSetValue = ({ user, id, setValue }: UseSetValueProps) => {
    const { setIsMe, setUser } = useProfileStore();

    const resetForm = useCallback(() => {
        PROFILE_SCHEMA_KEYS.forEach(key => {
            if (key === 'phone') {
                setValue(key, getMaskedPhone(user?.phone))
            } else {
                setValue(key, user?.[key])
            }
        });

    }, [setValue, user]);

    useEffect(() => {
        if (user) {
            setIsMe(!id);
            setUser(user);

            resetForm()
        }
    }, [setIsMe, setUser, user, id, resetForm]);

    return { resetForm };
};