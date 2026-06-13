
import { useFieldArray, useFormContext } from "react-hook-form";

import type { AccountSchemaFormType } from "../schema/accountSchema";
import type { Snackbar } from "../types";
import type { ContactType } from "@/entities/user";

type UseContactFieldProps = {
    setSnackbar: (snackbar: Snackbar) => void;
};

export const useContactField = ({ setSnackbar }: UseContactFieldProps) => {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray<AccountSchemaFormType>({
        control,
        name: 'contacts',
    });

    const handleAddContact = (type: ContactType) => {
        const isContactExists = fields.find(field => field.type === type);

        if (!isContactExists) {
            append({ type });
        } else {
            setSnackbar({ open: true, message: 'Контакт уже существует' });
        }
    };

    const handleRemoveContact = (index: number) => {
        remove(index);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '' });
    };

    return {
        fields,
        handleAddContact,
        handleRemoveContact,
        handleCloseSnackbar,
    };
};