import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartExtra {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  productId: string;
  nameEn: string;
  nameAr: string;
  price: number;
  quantity: number;
  image?: string;
  extras: CartExtra[];
  specialInstructions?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateExtras: (id: string, extras: CartExtra[]) => void;
  updateInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.productId}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      updateExtras: (id, extras) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, extras } : item
          ),
        }));
      },

      updateInstructions: (id, instructions) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, specialInstructions: instructions } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity;
          const extrasTotal = item.extras.reduce(
            (sum, extra) => sum + extra.price * extra.quantity,
            0
          );
          return total + itemTotal + extrasTotal;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
