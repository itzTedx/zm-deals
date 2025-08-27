"use client";

import { useState } from "react";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { OrderWithItemsAndProducts } from "../../types";

interface OrdersTableHeaderProps {
  data: OrderWithItemsAndProducts[];
  onSearchChange?: (search: string) => void;
  onStatusFilterChange?: (status: string) => void;
}

export function OrdersTableHeader({ data, onSearchChange, onStatusFilterChange }: OrdersTableHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilterChange?.(value);
  };

  // Calculate summary stats
  const totalOrders = data.length;
  const pendingOrders = data.filter((order) => order.status === "pending").length;
  const processingOrders = data.filter((order) => order.status === "processing").length;
  const shippedOrders = data.filter((order) => order.status === "shipped").length;
  const deliveredOrders = data.filter((order) => order.status === "delivered").length;
  const cancelledOrders = data.filter((order) => order.status === "cancelled").length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl">{totalOrders}</div>
          <div className="text-muted-foreground text-sm">Total Orders</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl text-yellow-600">{pendingOrders}</div>
          <div className="text-muted-foreground text-sm">Pending</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl text-blue-600">{processingOrders}</div>
          <div className="text-muted-foreground text-sm">Processing</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl text-indigo-600">{shippedOrders}</div>
          <div className="text-muted-foreground text-sm">Shipped</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl text-green-600">{deliveredOrders}</div>
          <div className="text-muted-foreground text-sm">Delivered</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-bold text-2xl text-red-600">{cancelledOrders}</div>
          <div className="text-muted-foreground text-sm">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search orders..."
              value={searchTerm}
            />
          </div>
          <Select onValueChange={handleStatusFilterChange} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
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
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
