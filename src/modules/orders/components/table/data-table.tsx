"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { updateOrderStatus } from "../../actions/mutation";
import { getAllOrders } from "../../actions/query";
import { OrderWithItemsAndProducts } from "../../types";
import { OrdersTableHeader } from "./header";

interface OrdersDataTableProps {
  data?: OrderWithItemsAndProducts[];
}

export function OrdersDataTable({ data: initialData }: OrdersDataTableProps) {
  const [data, setData] = useState<OrderWithItemsAndProducts[]>(initialData || []);
  const [filteredData, setFilteredData] = useState<OrderWithItemsAndProducts[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);

  // Fetch data if not provided
  useEffect(() => {
    if (!initialData) {
      fetchOrders();
    }
  }, [initialData]);

  // Filter data when search or status filter changes
  useEffect(() => {
    let filtered = [...data];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) => item.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllOrders();
      if (result.success) {
        setData(result.orders || []);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      setError("Failed to fetch orders");
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = useCallback(
    async (
      orderId: string,
      newStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed"
    ) => {
      try {
        setUpdatingOrder(orderId);
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
          // Refresh orders after update
          fetchOrders();
        } else {
          setError(result.error || "Failed to update order status");
        }
      } catch (error) {
        setError("Failed to update order status");
        console.error("Failed to update order status", error);
      } finally {
        setUpdatingOrder(null);
      }
    },
    []
  );

  // Simple columns for now
  const columns = useMemo<ColumnDef<OrderWithItemsAndProducts>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => <div className="font-medium">#{row.getValue("orderNumber")}</div>,
      },
      {
        accessorKey: "customerEmail",
        header: "Customer",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{order.user?.name || order.customerEmail}</span>
              <span className="text-muted-foreground text-sm">{order.customerEmail}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
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
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${getStatusColor(status)}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => {
          const amount = row.getValue("totalAmount") as number;
          return (
            <div className="font-medium">
              {new Intl.NumberFormat("en-AE", {
                style: "currency",
                currency: "AED",
              }).format(amount)}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-muted-foreground text-sm">
              {date.toLocaleDateString("en-AE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
          const items = row.getValue("items") as OrderWithItemsAndProducts["items"];
          return <div className="text-sm">{items?.length || 0} items</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const order = row.original;
          const isUpdating = updatingOrder === order.id;

          return (
            <div className="flex items-center gap-2">
              {order.status === "pending" && (
                <Button disabled={isUpdating} onClick={() => handleStatusUpdate(order.id, "confirmed")} size="sm">
                  {isUpdating ? "Updating..." : "Confirm"}
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button disabled={isUpdating} onClick={() => handleStatusUpdate(order.id, "processing")} size="sm">
                  {isUpdating ? "Updating..." : "Process"}
                </Button>
              )}
              {order.status === "processing" && (
                <Button disabled={isUpdating} onClick={() => handleStatusUpdate(order.id, "shipped")} size="sm">
                  {isUpdating ? "Updating..." : "Ship"}
                </Button>
              )}
              {order.status === "shipped" && (
                <Button disabled={isUpdating} onClick={() => handleStatusUpdate(order.id, "delivered")} size="sm">
                  {isUpdating ? "Updating..." : "Deliver"}
                </Button>
              )}
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(order.id, "cancelled")}
                  size="sm"
                  variant="destructive"
                >
                  {isUpdating ? "Updating..." : "Cancel"}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [updatingOrder, handleStatusUpdate]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <div className="text-muted-foreground">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <div className="mb-4 text-destructive">{error}</div>
            <Button onClick={fetchOrders} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <OrdersTableHeader data={data} onSearchChange={setSearchTerm} onStatusFilterChange={setStatusFilter} />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="h-px border-0 hover:bg-accent/50 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={cn("h-[inherit] last:py-0")} key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} of {table.getRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
              variant="outline"
            >
              <span className="sr-only">Go to first page</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 12H6M6 12L12 6M6 12L12 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              variant="outline"
            >
              <span className="sr-only">Go to previous page</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              variant="outline"
            >
              <span className="sr-only">Go to next page</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              variant="outline"
            >
              <span className="sr-only">Go to last page</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 12H18M18 12L12 6M6 12L12 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
