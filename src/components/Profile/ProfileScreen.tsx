import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Edit3, Save, X, Globe, Users, Lock, UserX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  email?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  privacy_settings: 'public' | 'friends' | 'private';
  is_guest: boolean;
  interests?: string[];
}

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    privacy_settings: 'public' as const,
    interests: [] as string[]
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Если профиль не найден, создаем его
        if (error.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
            privacy_settings: 'public',
            is_guest: false
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }

      // Инициализируем форму редактирования
      if (data) {
        setEditForm({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          privacy_settings: data.privacy_settings || 'public',
          interests: data.interests || []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          username: editForm.username,
          bio: editForm.bio,
          privacy_settings: editForm.privacy_settings,
          interests: editForm.interests
        })
        .eq('id', user.id);

      if (error) throw error;

      // Обновляем локальное состояние
      setProfile({
        ...profile,
        ...editForm
      });

      setEditing(false);
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter(i => i !== interest)
    });
  };

  const getPrivacyIcon = (setting: string) => {
    switch (setting) {
      case 'public': return Globe;
      case 'friends': return Users;
      case 'private': return Lock;
      default: return Globe;
    }
  };

  const getPrivacyLabel = (setting: string) => {
    switch (setting) {
      case 'public': return 'Публичный';
      case 'friends': return 'Только друзья';
      case 'private': return 'Приватный';
      default: return 'Публичный';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Профиль не найден</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
            </div>

            <div className="flex items-center space-x-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Редактировать</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditForm({
                        name: profile.name || '',
                        username: profile.username || '',
                        bio: profile.bio || '',
                        privacy_settings: profile.privacy_settings || 'public',
                        interests: profile.interests || []
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Отмена</span>
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-teal-500 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <p className="text-purple-100 mt-1">@{profile.username}</p>
                {profile.is_guest && (
                  <div className="flex items-center space-x-2 mt-2">
                    <UserX className="h-4 w-4" />
                    <span className="text-sm">Гостевой аккаунт</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {editing ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    О себе
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Расскажите немного о себе..."
                  />
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Настройки приватности
                  </label>
                  <div className="space-y-3">
                    {['public', 'friends', 'private'].map((setting) => {
                      const Icon = getPrivacyIcon(setting);
                      return (
                        <label key={setting} className="flex items-center">
                          <input
                            type="radio"
                            checked={editForm.privacy_settings === setting}
                            onChange={() => setEditForm({ ...editForm, privacy_settings: setting as any })}
                            className="mr-3 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">{getPrivacyLabel(setting)}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Интересы
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Добавить интерес..."
                    />
                    <button
                      onClick={addInterest}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info Display */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{profile.email || 'Не указан'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Имя пользователя</label>
                      <p className="text-gray-900">@{profile.username}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">О себе</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                )}

                {/* Privacy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Приватность</h3>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getPrivacyIcon(profile.privacy_settings), {
                      className: "h-4 w-4 text-gray-600"
                    })}
                    <span className="text-gray-600">{getPrivacyLabel(profile.privacy_settings)}</span>
                  </div>
                </div>

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Интересы</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Действия с аккаунтом</h3>
                  <button
                    onClick={signOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};