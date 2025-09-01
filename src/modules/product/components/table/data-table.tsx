"use client";

import { useMemo, useState } from "react";

import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import {
  Column,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowLeftToLineIcon, ArrowRightToLineIcon, EllipsisIcon, PinOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { ProductQueryResult } from "../../types";
import { getColumns } from "./columns";
import { Header } from "./header";

export type Item = {
  id: string;
  image: string;
  name: string;
  status: string;
  location: string;
  verified: boolean;
  referral: {
    name: string;
    image: string;
  };
  value: number;
  joinDate: string;
};

// Helper function to compute pinning styles for columns
const getPinningStyles = (column: Column<ProductQueryResult>): React.CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

export function ProductsTable({ data }: { data: ProductQueryResult[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "title",
      desc: false,
    },
  ]);

  //   const [data, setData] = useState<Item[]>([]);
  const [isLoading, _setIsLoading] = useState(false);

  const columns = useMemo(() => getColumns({ data }), [data]);

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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      <Header data={data} table={table} />

      {/* Table */}
      <div className="overflow-auto">
        <Table
          className="table-auto border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b"
          style={{
            width: table.getTotalSize(),
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  const isPinned = column.getIsPinned();
                  const isLastLeftPinned = isPinned === "left" && column.getIsLastColumn("left");
                  const isFirstRightPinned = isPinned === "right" && column.getIsFirstColumn("right");

                  return (
                    <TableHead
                      className={cn(
                        "relative h-9 select-none border-border border-y bg-card first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r",
                        "data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs [&[data-pinned][data-last-col]]:border-border",
                        "[&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=left][data-last-col=left]]:bg-card",
                        "[&[data-pinned=right][data-last-col=right]]:border-l"
                      )}
                      data-last-col={isLastLeftPinned ? "left" : isFirstRightPinned ? "right" : undefined}
                      data-pinned={isPinned || undefined}
                      key={header.id}
                      style={{ ...getPinningStyles(column) }}
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

                          {/* Pin/Unpin column controls */}
                          {header.column.getCanPin() &&
                            (header.column.getIsPinned() ? (
                              <Button
                                aria-label={`Unpin ${header.column.columnDef.header as string} column`}
                                className="-mr-1 size-7 shadow-none"
                                onClick={() => header.column.pin(false)}
                                size="icon"
                                title={`Unpin ${header.column.columnDef.header as string} column`}
                                variant="ghost"
                              >
                                <PinOffIcon aria-hidden="true" className="opacity-60" size={16} />
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-label={`Pin options for ${header.column.columnDef.header as string} column`}
                                    className="-mr-1 size-7 shadow-none"
                                    size="icon"
                                    title={`Pin options for ${header.column.columnDef.header as string} column`}
                                    variant="ghost"
                                  >
                                    <EllipsisIcon aria-hidden="true" className="opacity-60" size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => header.column.pin("left")}>
                                    <ArrowLeftToLineIcon aria-hidden="true" className="opacity-60" size={16} />
                                    Stick to left
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => header.column.pin("right")}>
                                    <ArrowRightToLineIcon aria-hidden="true" className="opacity-60" size={16} />
                                    Stick to right
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
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
            {isLoading ? (
              <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="h-px border-0 hover:bg-accent/50 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { column } = cell;
                    const isPinned = column.getIsPinned();
                    const isLastLeftPinned = isPinned === "left" && column.getIsLastColumn("left");
                    const isFirstRightPinned = isPinned === "right" && column.getIsFirstColumn("right");

                    return (
                      <TableCell
                        className={cn(
                          "h-[inherit] last:py-0",
                          "data-pinned:bg-background/90 data-pinned:backdrop-blur-xs [&[data-pinned][data-last-col]]:border-border",
                          "[&[data-pinned=left][data-last-col=left]]:border-r",
                          "[&[data-pinned=right][data-last-col=right]]:border-l"
                        )}
                        data-last-col={isLastLeftPinned ? "left" : isFirstRightPinned ? "right" : undefined}
                        data-pinned={isPinned || undefined}
                        key={cell.id}
                        style={{ ...getPinningStyles(column) }}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tbody aria-hidden="true" className="table-row h-1" />
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 bg-background py-2">
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
                  size="sm"
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
                  size="sm"
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
