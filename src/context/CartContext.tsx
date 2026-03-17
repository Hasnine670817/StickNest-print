import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  artwork?: string;
  design_id?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isCartLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadLocalCart = () => {
      const savedCart = localStorage.getItem('guest_cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing local cart:', e);
        }
      }
      setIsCartLoading(false);
    };

    if (user) {
      syncAndFetchCart();
    } else {
      loadLocalCart();
    }
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('guest_cart');
    }
  }, [cartItems, user]);

  const syncAndFetchCart = async () => {
    setIsCartLoading(true);
    
    // 1. Fetch existing items from Supabase
    const { data: dbData, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user?.id);
      
    if (fetchError) {
      console.error('Error fetching cart:', fetchError);
      setIsCartLoading(false);
      return;
    }

    let currentCart = dbData ? dbData.map((item: any) => {
      let artwork = item.artwork;
      let design_id = item.design_id;
      
      // Extract design_id from artwork if it was stored there as a fallback
      if (artwork && artwork.startsWith('DESIGN::')) {
        design_id = artwork.replace('DESIGN::', '');
        artwork = undefined;
      }

      return {
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        totalPrice: item.total_price,
        artwork,
        design_id
      };
    }) : [];

    // 2. If there are items in localStorage, sync them to Supabase
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      try {
        const localItems = JSON.parse(savedCart);
        if (localItems.length > 0) {
          const itemsToInsert = localItems.map((item: any) => ({
            user_id: user?.id,
            name: item.name,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            price_per_unit: item.pricePerUnit,
            total_price: item.totalPrice,
            artwork: item.artwork,
            design_id: item.design_id
          }));

          const { data: insertedData, error: insertError } = await supabase
            .from('cart_items')
            .insert(itemsToInsert)
            .select();

          if (insertError) {
            // Fallback: try inserting without design_id if the column doesn't exist
            // Store design_id in artwork column as a fallback
            const fallbackItems = itemsToInsert.map(({ design_id, artwork, ...rest }: any) => ({
              ...rest,
              artwork: artwork || (design_id ? `DESIGN::${design_id}` : null)
            }));
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('cart_items')
              .insert(fallbackItems)
              .select();
            
            if (!fallbackError && fallbackData) {
              const formattedInserted = fallbackData.map((item: any, index: number) => ({
                id: item.id,
                name: item.name,
                image: item.image,
                size: item.size,
                quantity: item.quantity,
                pricePerUnit: item.price_per_unit,
                totalPrice: item.total_price,
                artwork: item.artwork,
                design_id: itemsToInsert[index].design_id // Get from original payload
              }));
              currentCart = [...currentCart, ...formattedInserted];
            } else {
              console.error('Error syncing local cart (fallback):', fallbackError);
            }
          } else if (insertedData) {
            const formattedInserted = insertedData.map((item: any) => ({
              id: item.id,
              name: item.name,
              image: item.image,
              size: item.size,
              quantity: item.quantity,
              pricePerUnit: item.price_per_unit,
              totalPrice: item.total_price,
              artwork: item.artwork,
              design_id: item.design_id
            }));
            currentCart = [...currentCart, ...formattedInserted];
          }
        }
      } catch (e) {
        console.error('Error syncing local cart:', e);
      }
      localStorage.removeItem('guest_cart');
    }

    setCartItems(currentCart);
    setIsCartLoading(false);
  };

  const cartCount = cartItems.length;

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      // Add to local state for guest
      const newItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9) // Temporary ID for guest
      };
      setCartItems(prev => [...prev, newItem]);
      return;
    }

    setIsCartLoading(true);
    let data, error;
    
    const insertPayload = {
      user_id: user.id,
      name: item.name,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
      price_per_unit: item.pricePerUnit,
      total_price: item.totalPrice,
      artwork: item.artwork,
      design_id: item.design_id
    };

    const res = await supabase
      .from('cart_items')
      .insert([insertPayload])
      .select()
      .single();
      
    data = res.data;
    error = res.error;

    if (error) {
      // Fallback: try inserting without design_id if the column doesn't exist
      // Store design_id in artwork column as a fallback
      const { design_id, artwork, ...fallbackPayload } = insertPayload;
      const fallbackRes = await supabase
        .from('cart_items')
        .insert([{
          ...fallbackPayload,
          artwork: artwork || (design_id ? `DESIGN::${design_id}` : null)
        }])
        .select()
        .single();
        
      data = fallbackRes.data;
      error = fallbackRes.error;
    }
    
    if (error) {
      console.error('Error adding to cart:', error);
      setIsCartLoading(false);
      return;
    }
    
    if (data) {
      const newItem = {
        id: data.id,
        name: data.name,
        image: data.image,
        size: data.size,
        quantity: data.quantity,
        pricePerUnit: data.price_per_unit,
        totalPrice: data.total_price,
        artwork: data.artwork,
        design_id: item.design_id // Use item.design_id since DB might not return it if fallback was used
      };
      setCartItems(prev => [...prev, newItem as CartItem]);
    }
    setIsCartLoading(false);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', id);
      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.pricePerUnit
        };
      }
      return item;
    }));
  };

  const removeItem = async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error removing item:', error);
        return;
      }
    }

    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = async () => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) {
        console.error('Error clearing cart:', error);
      }
    }
    setCartItems([]);
    localStorage.removeItem('guest_cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, isCartLoading, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
