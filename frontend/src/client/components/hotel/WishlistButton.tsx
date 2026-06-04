import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { wishlistApi } from '../../../shared/api/wishlist';

interface WishlistButtonProps {
  hotelId: number;
  initialWishlisted?: boolean;
  size?: 'sm' | 'md';
}

export default function WishlistButton({ hotelId, initialWishlisted = false, size = 'md' }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [justToggled, setJustToggled] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: () => wishlistApi.toggle(hotelId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['hotels'] });
      await queryClient.cancelQueries({ queryKey: ['hotel'] });
      await queryClient.cancelQueries({ queryKey: ['search-hotels'] });
      await queryClient.cancelQueries({ queryKey: ['featured-hotels'] });
      await queryClient.cancelQueries({ queryKey: ['wishlists'] });

      const previousHotels = queryClient.getQueriesData({ queryKey: ['hotels'] });
      const previousHotel = queryClient.getQueriesData({ queryKey: ['hotel'] });
      const previousSearchHotels = queryClient.getQueriesData({ queryKey: ['search-hotels'] });
      const previousFeaturedHotels = queryClient.getQueriesData({ queryKey: ['featured-hotels'] });
      const previousWishlists = queryClient.getQueriesData({ queryKey: ['wishlists'] });

      const toggleInList = (old: { data: { id: number; is_wishlisted?: boolean }[] } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((hotel: { id: number; is_wishlisted?: boolean }) =>
            hotel.id === hotelId
              ? { ...hotel, is_wishlisted: !hotel.is_wishlisted }
              : hotel
          ),
        };
      };

      queryClient.setQueriesData<{ data: { id: number; is_wishlisted?: boolean }[] }>(
        { queryKey: ['search-hotels'] },
        toggleInList
      );

      queryClient.setQueriesData<{ data: { id: number; is_wishlisted?: boolean }[] }>(
        { queryKey: ['featured-hotels'] },
        toggleInList
      );

      queryClient.setQueriesData<{ data: { data: { id: number; is_wishlisted?: boolean }[] } }>(
        { queryKey: ['hotels'] },
        (old) => {
          if (!old?.data?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((hotel) =>
                hotel.id === hotelId
                  ? { ...hotel, is_wishlisted: !hotel.is_wishlisted }
                  : hotel
              ),
            },
          };
        }
      );

      queryClient.setQueriesData<{ data: { id: number; is_wishlisted?: boolean } }>(
        { queryKey: ['hotel'] },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: { ...old.data, is_wishlisted: !old.data.is_wishlisted },
          };
        }
      );

      return { previousHotels, previousHotel, previousSearchHotels, previousFeaturedHotels, previousWishlists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHotels) {
        context.previousHotels.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousHotel) {
        context.previousHotel.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSearchHotels) {
        context.previousSearchHotels.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousFeaturedHotels) {
        context.previousFeaturedHotels.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousWishlists) {
        context.previousWishlists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      queryClient.invalidateQueries({ queryKey: ['search-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['featured-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 300);
    toggleMutation.mutate();
  };

  const isWishlisted = (() => {
    if (toggleMutation.isPending) {
      return !initialWishlisted;
    }
    return initialWishlisted;
  })();

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex items-center justify-center rounded-full transition-spring-fast active:scale-90 ${
        size === 'sm'
          ? 'size-8 bg-white/90 backdrop-blur-sm shadow-sm'
          : 'size-10 bg-white/90 backdrop-blur-sm shadow-md'
      } ${isWishlisted ? 'text-red-500' : 'text-text-secondary hover:text-red-400'}`}
    >
      <Heart
        size={iconSize}
        className={`transition-spring-fast ${isWishlisted ? 'fill-red-500' : 'fill-none'} ${
          justToggled ? 'animate-[heart-pop_300ms_cubic-bezier(0.32,0.72,0,1)]' : ''
        }`}
      />
    </button>
  );
}
