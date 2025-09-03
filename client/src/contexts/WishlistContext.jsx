"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const initialState = {
  wishlist: [],
  loading: false,
  error: null,
  wishlistCount: 0,
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_WISHLIST":
      return {
        ...state,
        wishlist: action.payload.products || [],
        wishlistCount: (action.payload.products || []).length,
        loading: false,
        error: null,
      };
    case "ADD_TO_WISHLIST":
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
        wishlistCount: state.wishlistCount + 1,
        error: null,
      };
    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter(
          (item) => item.product._id !== action.payload
        ),
        wishlistCount: Math.max(0, state.wishlistCount - 1),
        error: null,
      };
    case "CLEAR_WISHLIST":
      return {
        ...state,
        wishlist: [],
        wishlistCount: 0,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated } = useAuth();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wishlist");
      }

      dispatch({ type: "SET_WISHLIST", payload: data.wishlist });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  // Add product to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      dispatch({
        type: "SET_ERROR",
        payload: "Please login to add items to wishlist",
      });
      return false;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to wishlist");
      }

      dispatch({ type: "SET_WISHLIST", payload: data.wishlist });
      return true;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/wishlist/remove/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from wishlist");
      }

      dispatch({ type: "SET_WISHLIST", payload: data.wishlist });
      return true;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear wishlist");
      }

      dispatch({ type: "CLEAR_WISHLIST" });
      return true;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return state.wishlist.some((item) => item.product._id === productId);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      dispatch({ type: "CLEAR_WISHLIST" });
    }
  }, [isAuthenticated]);

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist,
    clearError,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
