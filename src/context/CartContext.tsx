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
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setIsCartLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    setIsCartLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user?.id);
    if (error) {
      console.error('Error fetching cart:', error);
      setIsCartLoading(false);
      return;
    }
    if (data) {
      const formattedCart = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        totalPrice: item.total_price,
        artwork: item.artwork
      }));
      setCartItems(formattedCart as CartItem[]);
    }
    setIsCartLoading(false);
  };

  const cartCount = cartItems.length;

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: user.id,
        name: item.name,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
        price_per_unit: item.pricePerUnit,
        total_price: item.totalPrice,
        artwork: item.artwork
      }])
      .select()
      .single();
    if (error) {
      console.error('Error adding to cart:', error);
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
        artwork: data.artwork
      };
      setCartItems(prev => [...prev, newItem as CartItem]);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', id);
    if (!error) {
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
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);
    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);
    if (!error) {
      setCartItems([]);
    }
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
