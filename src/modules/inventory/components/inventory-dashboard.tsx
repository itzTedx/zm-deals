"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { IconAlertTriangle, IconPackage, IconTrendingDown, IconTrendingUp } from "@/assets/icons";

import { getLowStockProducts, getOutOfStockProducts, updateProductInventory } from "../actions/mutation";

interface InventoryProduct {
  productId: string;
  productTitle: string;
  currentStock: number;
  initialStock: number;
}

interface OutOfStockProduct {
  productId: string;
  productTitle: string;
  initialStock: number;
}

export function InventoryDashboard() {
  const [lowStockProducts, setLowStockProducts] = useState<InventoryProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<OutOfStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    setIsLoading(true);
    try {
      const [lowStockResult, outOfStockResult] = await Promise.all([getLowStockProducts(10), getOutOfStockProducts()]);

      if (lowStockResult.success) {
        setLowStockProducts(lowStockResult.products);
      }

      if (outOfStockResult.success) {
        setOutOfStockProducts(outOfStockResult.products);
      }
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStock(productId: string) {
    const newStock = Number.parseInt(stockInputs[productId] || "0", 10);

    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    setUpdatingStock(productId);
    try {
      const result = await updateProductInventory(productId, newStock);

      if (result.success) {
        toast.success("Stock updated successfully");
        // Refresh inventory data
        await loadInventoryData();
        // Clear the input
        setStockInputs((prev) => ({ ...prev, [productId]: "" }));
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    } finally {
      setUpdatingStock(null);
    }
  }

  function handleStockInputChange(productId: string, value: string) {
    setStockInputs((prev) => ({ ...prev, [productId]: value }));
  }

  const totalProducts = lowStockProducts.length + outOfStockProducts.length;
  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl">Inventory Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="h-8 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Inventory Management</h2>
        <Button onClick={loadInventoryData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Products</CardTitle>
            <IconPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalProducts}</div>
            <p className="text-muted-foreground text-xs">Products requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Low Stock</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">{lowStockCount}</div>
            <p className="text-muted-foreground text-xs">Less than 10 items in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Out of Stock</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">{outOfStockCount}</div>
            <p className="text-muted-foreground text-xs">No items available</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingDown className="h-5 w-5 text-orange-500" />
              Low Stock Products
            </CardTitle>
            <CardDescription>Products with less than 10 items in stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div className="flex items-center justify-between rounded-lg border p-3" key={product.productId}>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.productTitle}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="text-xs" variant="secondary">
                        Current: {product.currentStock}
                      </Badge>
                      <Badge className="text-xs" variant="outline">
                        Initial: {product.initialStock}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm" htmlFor={`stock-${product.productId}`}>
                        New Stock:
                      </Label>
                      <Input
                        className="w-20"
                        id={`stock-${product.productId}`}
                        min="0"
                        onChange={(e) => handleStockInputChange(product.productId, e.target.value)}
                        placeholder="0"
                        type="number"
                        value={stockInputs[product.productId] || ""}
                      />
                    </div>
                    <Button
                      disabled={updatingStock === product.productId}
                      onClick={() => handleUpdateStock(product.productId)}
                      size="sm"
                    >
                      {updatingStock === product.productId ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-red-500" />
              Out of Stock Products
            </CardTitle>
            <CardDescription>Products with no items available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outOfStockProducts.map((product) => (
                <div className="flex items-center justify-between rounded-lg border p-3" key={product.productId}>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.productTitle}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="text-xs" variant="destructive">
                        Out of Stock
                      </Badge>
                      <Badge className="text-xs" variant="outline">
                        Initial: {product.initialStock}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm" htmlFor={`stock-${product.productId}`}>
                        Restock:
                      </Label>
                      <Input
                        className="w-20"
                        id={`stock-${product.productId}`}
                        min="1"
                        onChange={(e) => handleStockInputChange(product.productId, e.target.value)}
                        placeholder="0"
                        type="number"
                        value={stockInputs[product.productId] || ""}
                      />
                    </div>
                    <Button
                      disabled={updatingStock === product.productId}
                      onClick={() => handleUpdateStock(product.productId)}
                      size="sm"
                    >
                      {updatingStock === product.productId ? "Updating..." : "Restock"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues */}
      {totalProducts === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-green-500" />
              All Good!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No inventory issues detected. All products have sufficient stock levels.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
