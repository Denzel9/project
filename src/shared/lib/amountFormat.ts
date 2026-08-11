export const formatAmount = (amount: number | string): string => {
    const raw = String(amount).trim().replace(/\s/g, '')
    if (!raw) return ''

    const normalized = raw.replace('.', ',')
    const endsWithDecimal = normalized.endsWith(',')
    const body = endsWithDecimal ? normalized.slice(0, -1) : normalized
    const [intRaw = '', fracRaw = ''] = body.split(',')
    const intDigits = intRaw.replace(/\D/g, '')
    const fracDigits = fracRaw.replace(/\D/g, '').slice(0, 2)

    if (!intDigits && !fracDigits && !endsWithDecimal) return ''

    const intFormatted = new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
    })
        .format(Number(intDigits || '0'))
        .replace(/\u00A0|\u202F/g, ' ')

    if (endsWithDecimal) {
        return `${intFormatted},`
    }

    if (fracDigits.length > 0) {
        return `${intFormatted},${fracDigits}`
    }

    return intFormatted
}

export const formatAmountInput = (value: string): string => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(/\./g, ',')
    if (!cleaned) return ''

    const firstComma = cleaned.indexOf(',')
    const normalized =
        firstComma === -1
            ? cleaned
            : `${cleaned.slice(0, firstComma + 1)}${cleaned
                .slice(firstComma + 1)
                .replace(/,/g, '')
                .slice(0, 2)}`

    return formatAmount(normalized)
}
