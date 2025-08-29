"use client";

import { useMemo, useState } from "react";

import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import {
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
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";
import type { Coupon } from "@/server/schema";

import { getColumns } from "./columns";
import { Header } from "./header";

interface CouponsDataTableProps {
  data: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => Promise<void>;
  isDeleting: string | null;
}

export function CouponsDataTable({ data, onEdit, onDelete, isDeleting }: CouponsDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "code",
      desc: false,
    },
  ]);

  const columns = useMemo(
    () => getColumns({ data, onEdit, onDelete, isDeleting }),
    [data, onEdit, onDelete, isDeleting]
  );

  const table = useReactTable({
    data,
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

  return (
    <div className="w-full space-y-4">
      <Header table={table} />

      {/* Table */}
      <div className="overflow-auto">
        <Table className="w-full border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={cn(
                        "relative h-9 select-none border-border border-y bg-card first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r",
                        "data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs [&[data-pinned][data-last-col]]:border-border",
                        "[&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=left][data-last-col=left]]:bg-card",
                        "[&[data-pinned=right][data-last-col=right]]:border-l"
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={cn(
                              header.column.getCanSort() && "flex h-full cursor-pointer select-none items-center gap-2"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              // Enhanced keyboard handling for sorting
                              if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                          >
                            <span className="truncate">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {(header.column.getCanSort() &&
                              {
                                asc: <RiArrowUpSLine aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
                                desc: <RiArrowDownSLine aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
                              }[header.column.getIsSorted() as string]) ??
                              null}
                          </div>
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <tbody aria-hidden="true" className="table-row h-1" />
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="h-px border-0 hover:bg-accent/50 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        className={cn(
                          "h-[inherit] last:py-0",
                          "data-pinned:bg-background/90 data-pinned:backdrop-blur-xs [&[data-pinned][data-last-col]]:border-border",
                          "[&[data-pinned=left][data-last-col=left]]:border-r",
                          "[&[data-pinned=right][data-last-col=right]]:border-l"
                        )}
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tbody aria-hidden="true" className="table-row h-1" />
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="flex-1 whitespace-nowrap text-muted-foreground text-sm">
            Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
            <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  aria-label="Go to previous page"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  variant="outline"
                >
                  Previous
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to next page"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  variant="outline"
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
