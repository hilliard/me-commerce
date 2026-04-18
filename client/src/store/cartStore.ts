import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId?: number;
  songId?: number;
  handle: string;
  title: string;
  artist?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (idParams: { productId?: number; songId?: number }) => void;
  updateQuantity: (idParams: { productId?: number; songId?: number }, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      addItem: (item) => set((state) => {
        // Deeply accurately verify uniqueness
        const existingItem = state.items.find((i) => 
          (item.productId !== undefined && i.productId === item.productId) || 
          (item.songId !== undefined && i.songId === item.songId)
        );
        if (existingItem) {
          return {
            items: state.items.map((i) => {
              const matchesProd = item.productId !== undefined && i.productId === item.productId;
              const matchesSong = item.songId !== undefined && i.songId === item.songId;
              if (matchesProd || matchesSong) {
                return { ...i, quantity: i.quantity + 1 };
              }
              return i;
            })
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      removeItem: ({ productId, songId }) => set((state) => ({
        items: state.items.filter((i) => {
            if (productId !== undefined) return i.productId !== productId;
            if (songId !== undefined) return i.songId !== songId;
            return true;
        }),
      })),
      updateQuantity: ({ productId, songId }, quantity) => set((state) => ({
        items: state.items.map((i) => {
            const matchesProd = productId !== undefined && i.productId === productId;
            const matchesSong = songId !== undefined && i.songId === songId;
            if (matchesProd || matchesSong) {
                return { ...i, quantity: Math.max(0, quantity) };
            }
            return i;
        }).filter(i => i.quantity > 0),
      })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'me-commerce-cart',
    }
  )
);
