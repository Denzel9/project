export const validatePassword = (password: string) => {
    if (password.length < 8) {
        return 'Пароль должен быть не менее 8 символов';
    }

    return false;
};

export const validationEqualPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
        return 'Пароли не совпадают';
    }

    return false;
};