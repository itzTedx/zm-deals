"use client";

import { useState } from "react";

import type { Coupon } from "@/server/schema";

import { deleteCoupon } from "../actions/mutation";
import { CouponsDataTable } from "./table/data-table";

interface CouponsTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
}

export function CouponsTable({ coupons, onEdit }: CouponsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (couponId: string) => {
    setIsDeleting(couponId);
    try {
      const result = await deleteCoupon(couponId);
      if (result.success) {
        console.log("Coupon deleted successfully");
      } else {
        console.error("Error deleting coupon:", result.error);
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return <CouponsDataTable data={coupons} isDeleting={isDeleting} onDelete={handleDelete} onEdit={onEdit} />;
}
