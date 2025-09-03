"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cartAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Ensure cart is always an array
  const setCartSafely = (newCart) => {
    if (Array.isArray(newCart)) {
      setCart(newCart);
    } else {
      console.warn("Attempted to set cart with non-array value:", newCart);
      setCart([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Reset cart when user logs out
      setCartSafely([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only calculate totals if cart is a valid array
    if (Array.isArray(cart)) {
      calculateTotals();
    }
  }, [cart]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      // The cart structure has items array, not direct cart array
      const cartData = response.data?.cart?.items || [];
      setCartSafely(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return { success: false };
    }

    try {
      const response = await cartAPI.addToCart(productId, quantity);
      // The cart structure has items array, not direct cart array
      const cartData = response.data?.cart?.items || [];
      setCartSafely(cartData);
      toast.success("Added to cart successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return { success: false };

    try {
      const response = await cartAPI.updateQuantity(productId, quantity);
      // The cart structure has items array, not direct cart array
      const cartData = response.data?.cart?.items || [];
      setCartSafely(cartData);
      toast.success("Cart updated successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return { success: false };

    try {
      const response = await cartAPI.removeFromCart(productId);
      // The cart structure has items array, not direct cart array
      const cartData = response.data?.cart?.items || [];
      setCartSafely(cartData);
      toast.success("Item removed from cart");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove item";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return { success: false };

    try {
      await cartAPI.clearCart();
      setCartSafely([]);
      toast.success("Cart cleared successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const calculateTotals = () => {
    // Ensure cart is an array before calling reduce
    if (!Array.isArray(cart)) {
      console.warn("Cart is not an array:", cart);
      setCartTotal(0);
      setCartCount(0);
      return;
    }

    // Filter out invalid items before calculating
    const validItems = cart.filter(
      (item) =>
        item &&
        item.product &&
        typeof item.product.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );

    const total = validItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const count = validItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    setCartTotal(total);
    setCartCount(count);
  };

  const value = {
    cart,
    loading,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
