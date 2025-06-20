// Утилиты для работы с изображениями
export const getPlaceholderImage = (width: number = 300, height: number = 200, category?: string): string => {
  const categories = {
    'Техника': 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300&h=200',
    'Путешествия': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
    'Образование': 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
    'Спорт': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
    'Красота': 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
    'Дом': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
  };

  if (category && categories[category as keyof typeof categories]) {
    return categories[category as keyof typeof categories];
  }

  return `https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}`;
};

export const generateAvatar = (name: string, size: number = 100): string => {
  const cleanName = name.replace(/[^a-zA-Zа-яА-Я\s]/g, '').trim();
  const encodedName = encodeURIComponent(cleanName);
  
  // Используем UI Avatars с кастомными цветами из нашей темы
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=B48DFE&color=ffffff&bold=true&format=png`;
};

export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl?: string,
  category?: string
) => {
  const img = event.currentTarget;
  if (fallbackUrl) {
    img.src = fallbackUrl;
  } else {
    img.src = getPlaceholderImage(300, 200, category);
  }
};

export const handleAvatarError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  name: string,
  size: number = 100
) => {
  const img = event.currentTarget;
  img.src = generateAvatar(name, size);
};