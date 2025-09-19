"use client";

import { useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

const WishlistButton = ({ productId, className = "", size = "sm" }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`
        ${
          inWishlist
            ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
            : "bg-white border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-600 hover:text-amber-700"
        } 
        p-3 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 min-w-[48px] h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
      )}
    </button>
  );
};

export default WishlistButton;
