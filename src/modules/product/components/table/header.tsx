import { useId, useMemo, useRef } from "react";

import {
  RiBardLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiFilter3Line,
  RiSearch2Line,
} from "@remixicon/react";
import { Table } from "@tanstack/react-table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { ProductQueryResult } from "../../types";

interface Props {
  table: Table<ProductQueryResult>;
  data: ProductQueryResult[];
}

export const Header = ({ table, data }: Props) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const updatedData = data.filter((item) => !selectedRows.some((row) => row.original.id === item.id));
    // setData(updatedData);
    table.resetRowSelection();
  };

  // Extract complex expressions into separate variables
  const statusColumn = table.getColumn("status");
  const statusFacetedValues = statusColumn?.getFacetedUniqueValues();
  const statusFilterValue = statusColumn?.getFilterValue();

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!statusColumn) return [];
    const values = Array.from(statusFacetedValues?.keys() ?? []);
    return values.sort();
  }, [statusColumn, statusFacetedValues]);

  const statusCounts = useMemo(() => {
    if (!statusColumn) return new Map();
    return statusFacetedValues ?? new Map();
  }, [statusColumn, statusFacetedValues]);

  const selectedStatuses = useMemo(() => {
    return (statusFilterValue as string[]) ?? [];
  }, [statusFilterValue]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Filter by title */}
        <div className="relative">
          <Input
            aria-label="Search by title"
            className={cn(
              "peer min-w-60 bg-background bg-gradient-to-br from-accent/60 to-accent ps-9",
              Boolean(table.getColumn("title")?.getFilterValue()) && "pe-9"
            )}
            id={`${id}-input`}
            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            placeholder="Search by title"
            ref={inputRef}
            type="text"
            value={(table.getColumn("title")?.getFilterValue() ?? "") as string}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
            <RiSearch2Line aria-hidden="true" size={20} />
          </div>
          {Boolean(table.getColumn("title")?.getFilterValue()) && (
            <button
              aria-label="Clear filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                table.getColumn("title")?.setFilterValue("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <RiCloseCircleLine aria-hidden="true" size={16} />
            </button>
          )}
        </div>
      </div>
      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Delete button */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-auto" variant="outline">
                <RiDeleteBinLine aria-hidden="true" className="-ms-1 opacity-60" size={16} />
                Delete
                <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {table.getSelectedRowModel().rows.length}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                >
                  <RiErrorWarningLine className="opacity-80" size={16} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {table.getSelectedRowModel().rows.length}{" "}
                    selected {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRows}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {/* Filter by status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <RiFilter3Line aria-hidden="true" className="-ms-1.5 size-5 text-muted-foreground/60" size={20} />
              Filter
              {selectedStatuses.length > 0 && (
                <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {selectedStatuses.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto min-w-36 p-3">
            <div className="space-y-3">
              <div className="font-medium text-muted-foreground/60 text-xs uppercase">Status</div>
              <div className="space-y-3">
                {uniqueStatusValues.map((value, i) => (
                  <div className="flex items-center gap-2" key={value}>
                    <Checkbox
                      checked={selectedStatuses.includes(value)}
                      id={`${id}-${i}`}
                      onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                    />
                    <Label className="flex grow justify-between gap-2 font-normal" htmlFor={`${id}-${i}`}>
                      {value} <span className="ms-2 text-muted-foreground text-xs">{statusCounts.get(value)}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* New filter button */}
        <Button variant="outline">
          <RiBardLine aria-hidden="true" className="-ms-1.5 size-5 text-muted-foreground/60" size={20} />
          New Filter
        </Button>
      </div>
    </div>
  );
};
