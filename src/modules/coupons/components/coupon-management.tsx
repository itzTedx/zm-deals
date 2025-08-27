"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Coupon } from "@/server/schema";

import { deleteCoupon } from "../actions/mutation";
import { CouponForm } from "./coupon-form";
import { CouponsDataTable } from "./table/data-table";

interface Props {
  coupons?: Coupon[];
}

export function CouponManagement({ coupons }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCoupon(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCoupon(null);
  };

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

  return (
    <div className="space-y-6">
      {coupons && (
        <CouponsDataTable data={coupons} isDeleting={isDeleting} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <Dialog onOpenChange={setIsFormOpen} open={isFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
              <Button className="h-6 w-6 p-0" onClick={handleFormCancel} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <CouponForm coupon={editingCoupon || undefined} onCancel={handleFormCancel} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
