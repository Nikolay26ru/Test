import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistsApi, type CreateWishlistData } from '../api/wishlists';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useWishlists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: wishlists = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['wishlists', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return wishlistsApi.getWishlists(user.id);
    },
    enabled: !!user,
    select: (response) => response.success ? response.data : []
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWishlistData) => {
      if (!user) throw new Error('User not authenticated');
      return wishlistsApi.createWishlist(data, user.id);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success('Список желаний создан!');
      } else {
        toast.error(response.error || 'Ошибка создания списка');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка создания списка');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWishlistData> }) =>
      wishlistsApi.updateWishlist(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        toast.success('Список обновлен!');
      } else {
        toast.error(response.error || 'Ошибка обновления списка');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления списка');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wishlistsApi.deleteWishlist(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] });
        toast.success('Список удален!');
      } else {
        toast.error(response.error || 'Ошибка удаления списка');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления списка');
    }
  });

  return {
    wishlists,
    isLoading,
    error,
    refetch,
    createWishlist: createMutation.mutate,
    updateWishlist: updateMutation.mutate,
    deleteWishlist: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

export const useWishlist = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['wishlist', id],
    queryFn: () => wishlistsApi.getWishlist(id),
    enabled: !!id,
    select: (response) => response.success ? response.data : null
  });

  const {
    data: items = [],
    isLoading: isLoadingItems,
    refetch: refetchItems
  } = useQuery({
    queryKey: ['wishlist-items', id],
    queryFn: () => wishlistsApi.getWishlistItems(id),
    enabled: !!id,
    select: (response) => response.success ? response.data : []
  });

  return {
    wishlist,
    items,
    isLoading: isLoading || isLoadingItems,
    error,
    refetch: () => {
      refetch();
      refetchItems();
    }
  };
};