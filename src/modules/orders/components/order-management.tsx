"use client";

import { useEffect, useState } from "react";

import { CheckCircle, Clock, Package, Search, Truck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { updateOrderStatus } from "../actions/mutation";
import { getAllOrders } from "../actions/query";
import { OrderWithItemsAndProducts } from "../types";

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithItemsAndProducts[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItemsAndProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      setError("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) => item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Refresh orders after update
        fetchOrders();
      } else {
        setError(result.error || "Failed to update order status");
      }
    } catch (error) {
      setError("Failed to update order status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(numericPrice);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading orders...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch the orders.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={fetchOrders}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl">Order Management</h2>
        <p className="text-muted-foreground">Manage all customer orders</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                value={searchTerm}
              />
            </div>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">No orders found</h3>
                <p className="text-muted-foreground">No orders match your current filters.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card className="transition-shadow hover:shadow-md" key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Order Info */}
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                        <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</p>
                        <p className="text-muted-foreground text-sm">{order.user?.name || order.customerEmail}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Amount */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <Button onClick={() => handleStatusUpdate(order.id, "confirmed")} size="sm">
                        Confirm
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button onClick={() => handleStatusUpdate(order.id, "processing")} size="sm">
                        Process
                      </Button>
                    )}
                    {order.status === "processing" && (
                      <Button onClick={() => handleStatusUpdate(order.id, "shipped")} size="sm">
                        Ship
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button onClick={() => handleStatusUpdate(order.id, "delivered")} size="sm">
                        Deliver
                      </Button>
                    )}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <Button onClick={() => handleStatusUpdate(order.id, "cancelled")} size="sm" variant="destructive">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item) => (
                      <div className="flex items-center gap-3" key={item.id}>
                        {item.productImage && (
                          <img
                            alt={item.productTitle}
                            className="h-10 w-10 rounded object-cover"
                            src={item.productImage}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{item.productTitle}</p>
                          <p className="text-muted-foreground text-xs">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <p className="text-muted-foreground text-sm">+{(order.items?.length || 0) - 2} more items</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <p className="font-bold text-2xl">{orders.length}</p>
                <p className="text-muted-foreground text-sm">Total Orders</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{orders.filter((o) => o.status === "pending").length}</p>
                <p className="text-muted-foreground text-sm">Pending</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{orders.filter((o) => o.status === "shipped").length}</p>
                <p className="text-muted-foreground text-sm">In Transit</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{orders.filter((o) => o.status === "delivered").length}</p>
                <p className="text-muted-foreground text-sm">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
