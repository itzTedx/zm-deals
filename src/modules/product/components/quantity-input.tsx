"use client";

import { useState } from "react";

import QuantityInputBasic from "@/components/ui/quantity-input";

export const QuantityInput = () => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };
  return <QuantityInputBasic onChange={handleQuantityChange} quantity={quantity} />;
};
