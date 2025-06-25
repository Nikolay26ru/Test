import React from 'react';
import { Plus } from 'lucide-react';
import { WishListCard } from './WishListCard';
import type { WishList } from '../../types';

interface WishListGridProps {
  wishlists: WishList[];
  onCreateNew: () => void;
  onWishListClick: (wishlist: WishList) => void;
}

export const WishListGrid: React.FC<WishListGridProps> = ({
  wishlists,
  onCreateNew,
  onWishListClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Create New Card */}
      <div
        onClick={onCreateNew}
        className="bg-gradient-to-br from-purple-50 to-teal-50 border-2 border-dashed border-purple-200 rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-teal-100 transition-all duration-200 group"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
          <Plus className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Создать новый список
        </h3>
        <p className="text-sm text-gray-500 text-center px-4">
          Добавьте свои желания и поделитесь ими с близкими
        </p>
      </div>

      {/* Wish Lists */}
      {wishlists.map((wishlist) => (
        <WishListCard
          key={wishlist.id}
          wishlist={wishlist}
          onClick={() => onWishListClick(wishlist)}
        />
      ))}
    </div>
  );
};