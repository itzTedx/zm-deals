import { useId, useRef } from "react";

import { RiCloseCircleLine, RiSearch2Line } from "@remixicon/react";
import { Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import type { Coupon } from "@/server/schema";

interface HeaderProps {
  table: Table<Coupon>;
}

export function Header({ table }: HeaderProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <div className="relative">
          <Input
            aria-label="Search coupons"
            className={cn(
              "peer max-w-sm bg-background bg-gradient-to-br from-accent/60 to-accent ps-9",
              Boolean(table.getColumn("code")?.getFilterValue()) && "pe-9"
            )}
            id={`${id}-input`}
            onChange={(e) => table.getColumn("code")?.setFilterValue(e.target.value)}
            placeholder="Search coupons..."
            ref={inputRef}
            type="text"
            value={(table.getColumn("code")?.getFilterValue() ?? "") as string}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
            <RiSearch2Line aria-hidden="true" size={20} />
          </div>
          {Boolean(table.getColumn("code")?.getFilterValue()) && (
            <button
              aria-label="Clear filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                table.getColumn("code")?.setFilterValue("");
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
      <Select
        onValueChange={(value) => {
          if (value === "all") {
            table.getColumn("isActive")?.setFilterValue(undefined);
          } else {
            table.getColumn("isActive")?.setFilterValue(value);
          }
        }}
        value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Coupons</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
