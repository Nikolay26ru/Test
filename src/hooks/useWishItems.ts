import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistsApi, type CreateWishItemData } from '../api/wishlists';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useWishItems = (wishlistId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateWishItemData) => wishlistsApi.createWishItem(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlist-items', wishlistId] });
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success('Товар добавлен!');
      } else {
        toast.error(response.error || 'Ошибка добавления товара');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка добавления товара');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWishItemData> }) =>
      wishlistsApi.updateWishItem(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlist-items', wishlistId] });
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success('Товар обновлен!');
      } else {
        toast.error(response.error || 'Ошибка обновления товара');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления товара');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wishlistsApi.deleteWishItem(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlist-items', wishlistId] });
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success('Товар удален!');
      } else {
        toast.error(response.error || 'Ошибка удаления товара');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления товара');
    }
  });

  const togglePurchasedMutation = useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) =>
      wishlistsApi.togglePurchased(id, isPurchased, user?.id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlist-items', wishlistId] });
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success(response.data?.is_purchased ? 'Товар отмечен как купленный' : 'Товар отмечен как не купленный');
      } else {
        toast.error(response.error || 'Ошибка обновления статуса');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления статуса');
    }
  });

  return {
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    togglePurchased: togglePurchasedMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: togglePurchasedMutation.isPending
  };
};