import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен')
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Подтверждение пароля обязательно'),
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .required('Имя обязательно'),
  username: yup
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/, 'Имя пользователя может содержать только буквы, цифры и подчеркивания')
    .optional()
});

export const wishlistSchema = yup.object({
  title: yup
    .string()
    .min(1, 'Название обязательно')
    .max(100, 'Название не должно превышать 100 символов')
    .required('Название обязательно'),
  description: yup
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
  cover_image: yup
    .string()
    .url('Неверный формат URL')
    .optional(),
  is_public: yup
    .boolean()
    .required()
});

export const wishItemSchema = yup.object({
  title: yup
    .string()
    .min(1, 'Название обязательно')
    .max(200, 'Название не должно превышать 200 символов')
    .required('Название обязательно'),
  description: yup
    .string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  price: yup
    .number()
    .min(0, 'Цена не может быть отрицательной')
    .max(10000000, 'Цена слишком большая')
    .optional(),
  image_url: yup
    .string()
    .url('Неверный формат URL')
    .optional(),
  store_url: yup
    .string()
    .url('Неверный формат URL')
    .optional(),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Неверный приоритет')
    .required()
});

export const guestSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .optional()
});