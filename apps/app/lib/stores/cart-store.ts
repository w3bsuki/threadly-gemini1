import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  size?: string;
  color?: string;
  condition: string;
  availableQuantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === newItem.productId);
          
          if (existingItem) {
            // Update quantity if item already exists
            const newQuantity = Math.min(
              existingItem.quantity + 1,
              existingItem.availableQuantity
            );
            existingItem.quantity = newQuantity;
          } else {
            // Add new item to cart
            const cartItem: CartItem = {
              ...newItem,
              id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              quantity: 1,
            };
            state.items.push(cartItem);
          }
        });
      },

      removeItem: (productId) => {
        set((state) => {
          state.items = state.items.filter(item => item.productId !== productId);
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const item = state.items.find(item => item.productId === productId);
          if (item) {
            item.quantity = Math.min(quantity, item.availableQuantity);
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
        });
      },

      toggleCart: () => {
        set((state) => {
          state.isOpen = !state.isOpen;
        });
      },

      closeCart: () => {
        set((state) => {
          state.isOpen = false;
        });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemCount: (productId) => {
        const item = get().items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
      },

      isInCart: (productId) => {
        return get().items.some(item => item.productId === productId);
      },
    })),
    {
      name: 'threadly-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items 
      }),
    }
  )
);