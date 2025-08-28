"use client";

import { useState } from "react";

import { AlertTriangle, CheckCircle, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getCouponSyncStatus, syncAllCouponsToStripe } from "../actions/sync-utility";

interface SyncStatus {
  total: number;
  synced: number;
  notSynced: number;
  syncStatus: Array<{
    dbCoupon: any;
    hasStripeId: boolean;
    stripeCoupon: any;
    status: "synced" | "not_synced";
  }>;
}

export function StripeSyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const loadSyncStatus = async () => {
    setIsRefreshing(true);
    try {
      const result = await getCouponSyncStatus();
      if (result.success && result.data) {
        setSyncStatus(result.data);
      } else {
        toast.error("Failed to load sync status");
      }
    } catch (error) {
      toast.error("Error loading sync status");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAllCouponsToStripe();

      if (result.success) {
        toast.success(`Successfully synced ${result.data?.synced || 0} coupons to Stripe`);
        await loadSyncStatus(); // Refresh the status
      } else {
        toast.error(result.error || "Failed to sync coupons");
      }
    } catch (error) {
      toast.error("Error syncing coupons to Stripe");
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial status
  useState(() => {
    loadSyncStatus();
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Stripe Coupon Sync
        </CardTitle>
        <CardDescription>Manage synchronization between your database coupons and Stripe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status Overview */}
        {syncStatus && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <div className="font-bold text-2xl text-blue-600">{syncStatus.total}</div>
              <div className="text-muted-foreground text-sm">Total Coupons</div>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <div className="font-bold text-2xl text-green-600">{syncStatus.synced}</div>
              <div className="text-muted-foreground text-sm">Synced to Stripe</div>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <div className="font-bold text-2xl text-orange-600">{syncStatus.notSynced}</div>
              <div className="text-muted-foreground text-sm">Not Synced</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" disabled={isLoading || syncStatus?.notSynced === 0} onClick={handleSync}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync to Stripe
              </>
            )}
          </Button>
          <Button disabled={isRefreshing} onClick={loadSyncStatus} variant="outline">
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sync Status Details */}
        {syncStatus && syncStatus.syncStatus.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Coupon Sync Details</h4>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {syncStatus.syncStatus.map((item) => (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3" key={item.dbCoupon.id}>
                    <div className="flex items-center gap-3">
                      {item.hasStripeId ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{item.dbCoupon.code}</div>
                        <div className="text-muted-foreground text-sm">
                          {item.dbCoupon.discountType === "percentage"
                            ? `${item.dbCoupon.discountValue}% off`
                            : `$${item.dbCoupon.discountValue} off`}
                        </div>
                      </div>
                    </div>
                    <Badge variant={item.hasStripeId ? "default" : "secondary"}>
                      {item.hasStripeId ? "Synced" : "Not Synced"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Information Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Syncing coupons to Stripe enables native discount handling during checkout. This provides better user
            experience and more accurate discount calculations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
