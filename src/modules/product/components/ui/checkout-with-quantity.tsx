"use client";

import { useState } from "react";

import { QuantityInput } from "@/components/ui/quantity-input";
import StarRating from "@/components/ui/rating";

import { pluralize } from "@/lib/functions/pluralize";

import { calculateAverageRating } from "../../actions/helper";
import { ProductQueryResult } from "../../types";
import { BuyButton } from "./buy-button";

interface Props {
  data: ProductQueryResult;
}

export const CheckoutWithQuantity = ({ data }: Props) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-500 text-sm">Qty</p>
          <QuantityInput onChange={handleQuantityChange} quantity={quantity} />
        </div>
        <div className="flex items-center gap-1">
          <p className="font-medium text-sm text-yellow-500">{calculateAverageRating(data.reviews)}</p>
          <StarRating readOnly value={calculateAverageRating(data.reviews)} />
          <p className="font-medium text-gray-500 text-sm">
            {data.reviews?.length} {pluralize("review", data.reviews?.length || 0)}
          </p>
        </div>
      </div>
      <BuyButton data={data} quantity={quantity} />
    </>
  );
};
