import type { SanityImage } from './sanity';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string | { current: string };
  image?: Array<{
    asset: {
      _id: string;
      url: string;
      metadata?: {
        dimensions: {
          width: number;
          height: number;
          aspectRatio: number;
        };
      };
    };
    alt?: string;
  }>;
  details?: any;
}

export interface CartState {
  showCart: boolean;
  cartItems: CartItem[];
  totalPrice: number;
  totalQuantities: number;
  qty: number;
  cartCheck: any[];
  mobile: boolean;
}

export interface CartContextType extends CartState {
  setShowCart: (show: boolean) => void;
  setCartItems: (items: CartItem[]) => void;
  setTotalPrice: (value: number | ((prev: number) => number)) => void;
  setTotalQuantities: (value: number | ((prev: number) => number)) => void;
  setCartCheck: (items: any[]) => void;
  setMobile: (isMobile: boolean) => void;
  setQty: (qty: number) => void;
  incQty: () => void;
  decQty: () => void;
  onAdd: (product: CartItem, quantity: number) => void;
  toggleCartItemQuantity: (id: string, value: 'inc' | 'dec') => void;
  onRemove: (product: CartItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
}