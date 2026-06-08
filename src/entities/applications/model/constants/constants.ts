// Основные категории одежды
export const CLOTHING_CATEGORIES = [
  'Верхняя одежда',
  'Верх',
  'Низ',
  'Платья',
  'Нижнее белье',
  'Купальники',
  'Спортивная одежда',
  'Обувь',
  'Аксессуары',
  'Головные уборы',
] as const

// Типы верхней одежды
export const OUTERWEAR_TYPES = [
  'Пальто',
  'Тренч',
  'Куртка',
  'Блейзер',
  'Жилет',
  'Ветровка',
  'Дождевик',
  'Пуховик',
  'Косуха',
  'Джинсовка',
] as const

// Типы верха
export const TOPS_TYPES = [
  'Футболка',
  'Рубашка',
  'Блузка',
  'Поло',
  'Лонгслив',
  'Свитер',
  'Кардиган',
  'Толстовка',
  'Худи',
  'Топ',
  'Боди',
] as const

// Типы низа
export const BOTTOMS_TYPES = [
  'Джинсы',
  'Брюки',
  'Штаны',
  'Шорты',
  'Юбка',
  'Леггинсы',
  'Бриджи',
  'Капри',
  'Кюлоты',
] as const

// Типы платьев
export const DRESSES_TYPES = [
  'Платье',
  'Сарафан',
  'Коктейльное платье',
  'Вечернее платье',
  'Повседневное платье',
  'Летнее платье',
  'Королевское платье',
] as const

// Типы нижнего белья
export const UNDERWEAR_TYPES = [
  'Бюстгальтер',
  'Трусы',
  'Комплект белья',
  'Боди',
  'Корсет',
  'Пижама',
  'Ночная рубашка',
] as const

// Типы купальников
export const SWIMWEAR_TYPES = ['Купальник', 'Бикини', 'Плавки', 'Шорты для плавания', 'Пляжный костюм'] as const

// Типы спортивной одежды
export const SPORTSWEAR_TYPES = [
  'Спортивные брюки',
  'Спортивные шорты',
  'Спортивная футболка',
  'Спортивный топ',
  'Спортивный костюм',
  'Леггинсы',
  'Велосипедки',
] as const

// Типы обуви
export const FOOTWEAR_TYPES = [
  'Кроссовки',
  'Туфли',
  'Ботинки',
  'Сапоги',
  'Сандалии',
  'Босоножки',
  'Лоферы',
  'Мокасины',
  'Эспадрильи',
  'Балетки',
  'Каблуки',
] as const

// Типы аксессуаров
export const ACCESSORIES_TYPES = [
  'Сумка',
  'Рюкзак',
  'Кошелек',
  'Ремень',
  'Шарф',
  'Палантин',
  'Перчатки',
  'Шапка',
  'Кепка',
  'Шляпа',
  'Бижутерия',
  'Солнечные очки',
] as const

// Головные уборы
export const HEADWEAR_TYPES = [
  'Шапка',
  'Бейсболка',
  'Кепка',
  'Шляпа',
  'Панама',
  'Берет',
  'Повязка',
  'Тюрбан',
  'Ушанка',
  'Ковбойская шляпа',
  'Федора',
  'Трилби',
  'Клош',
  'Капор',
  'Снуд',
  'Бафф',
  'Балаклава',
  'Капюшон',
] as const

export const SUB_TYPE_CLOTHING = {
  'Верхняя одежда': OUTERWEAR_TYPES,
  Верх: TOPS_TYPES,
  Низ: BOTTOMS_TYPES,
  Платья: DRESSES_TYPES,
  'Нижнее белье': UNDERWEAR_TYPES,
  Купальники: SWIMWEAR_TYPES,
  'Спортивная одежда': SPORTSWEAR_TYPES,
  Обувь: FOOTWEAR_TYPES,
  Аксессуары: ACCESSORIES_TYPES,
  'Головные уборы': HEADWEAR_TYPES,
}

// Все типы одежды в одном массиве
export const ALL_CLOTHING_TYPES = [
  ...OUTERWEAR_TYPES,
  ...TOPS_TYPES,
  ...BOTTOMS_TYPES,
  ...DRESSES_TYPES,
  ...UNDERWEAR_TYPES,
  ...SWIMWEAR_TYPES,
  ...SPORTSWEAR_TYPES,
  ...FOOTWEAR_TYPES,
  ...ACCESSORIES_TYPES,
] as const

export enum DEAL_TYPES_OPTIONS {
  RENT = 'Аренда',
  BUY = 'Покупка',
  CHANGE = 'Обмен',
}

export enum CONDITION_TYPES_OPTIONS {
  NEW = 'Новое',
  AMAZING = 'Отличное',
  GOOD = 'Хорошее',
  NOT_BAD = 'Удовлетворительное',
}

export const MATERIALS = [
  'Хлопок',
  'Полиэстер',
  'Деним',
  'Шерсть',
  'Лен',
  'Нейлон',
  'Шелк',
  'Вискоза',
  'Эластан',
  'Кашемир',
  'Кожа',
  'Замша',
  'Мохер',
  'Ангора',
  'Акрил',
  'Бархат',
  'Велюр',
  'Резина',
  'Ситец',
  'Сатин',
]

export const SIZES = ['XS', 'S', 'L', 'XL', 'XXL']
export const COLORS = ['Другой', 'yellow', 'red', 'black', 'brown', 'green']
export const COLORS_MAP = {
  Другой: 'Другой',
  yellow: 'Жёлтый',
  red: 'Красный',
  black: 'Черный',
  brown: 'Коричневый',
  green: 'Зеленый',
}
export const DEAL_TYPES = [DEAL_TYPES_OPTIONS.RENT, DEAL_TYPES_OPTIONS.BUY, DEAL_TYPES_OPTIONS.CHANGE]
export const CONDITION_TYPES = [
  CONDITION_TYPES_OPTIONS.NEW,
  CONDITION_TYPES_OPTIONS.AMAZING,
  CONDITION_TYPES_OPTIONS.GOOD,
  CONDITION_TYPES_OPTIONS.NOT_BAD,
]
