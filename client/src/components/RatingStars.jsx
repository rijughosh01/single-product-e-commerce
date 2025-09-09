"use client";

import React from "react";
import { Star, StarHalf } from "lucide-react";

const RatingStars = ({ rating = 0, className = "w-5 h-5" }) => {
  const value = Number(rating) || 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const threshold = i - 0.5;
    if (value >= i) {
      stars.push(
        <Star key={i} className={`${className} text-yellow-400 fill-current`} />
      );
    } else if (value >= threshold) {
      stars.push(
        <StarHalf
          key={i}
          className={`${className} text-yellow-400 fill-current`}
        />
      );
    } else {
      stars.push(<Star key={i} className={`${className} text-gray-300`} />);
    }
  }
  return <>{stars}</>;
};

export default RatingStars;
