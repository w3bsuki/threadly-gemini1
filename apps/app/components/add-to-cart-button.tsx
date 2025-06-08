'use client';

import { useState } from 'react';
import { useCartStore, type CartItem } from '@/lib/stores/cart-store';
import { Button } from '@repo/design-system/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

interface Product {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  seller: {
    firstName?: string;
    lastName?: string;
  };
  images: Array<{
    url: string;
  }>;
  condition: string;
  size?: string;
  color?: string;
  status: string;
}

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function AddToCartButton({ 
  product, 
  className,
  variant = 'default',
  size = 'default',
  showText = true
}: AddToCartButtonProps) {
  const { addItem, isInCart, toggleCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = isInCart(product.id);
  const sellerName = `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Unknown Seller';

  const handleAddToCart = async () => {
    if (product.status !== 'AVAILABLE') return;
    
    setIsAdding(true);
    
    try {
      const cartItem: Omit<CartItem, 'id' | 'quantity'> = {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0]?.url || '/placeholder-image.jpg',
        sellerId: product.sellerId,
        sellerName,
        size: product.size,
        color: product.color,
        condition: product.condition,
        availableQuantity: 1, // Most fashion items are unique
      };

      addItem(cartItem);
      
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      
      // Open cart dropdown to show item was added
      toggleCart();
      
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = product.status !== 'AVAILABLE' || isAdding;

  const getButtonText = () => {
    if (!showText) return null;
    
    if (justAdded) return 'Added!';
    if (isAdding) return 'Adding...';
    if (inCart) return 'In Cart';
    if (product.status === 'SOLD') return 'Sold';
    if (product.status === 'REMOVED') return 'Unavailable';
    return 'Add to Cart';
  };

  const getButtonIcon = () => {
    if (justAdded) return <Check className="h-4 w-4" />;
    return <ShoppingCart className="h-4 w-4" />;
  };

  return (
    <Button
      variant={inCart ? 'secondary' : variant}
      size={size}
      className={cn(className)}
      onClick={handleAddToCart}
      disabled={isDisabled}
    >
      {showText ? (
        <>
          {getButtonIcon()}
          {getButtonText() && <span className="ml-2">{getButtonText()}</span>}
        </>
      ) : (
        getButtonIcon()
      )}
    </Button>
  );
}