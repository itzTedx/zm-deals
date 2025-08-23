import Image from "next/image";
import Link from "next/link";

import { RiCheckLine } from "@remixicon/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { IconCurrency } from "@/assets/icons/currency";

import { formatDate } from "@/lib/functions/format-date";
import { cn } from "@/lib/utils";

import { ProductQueryResult } from "../../types";
import { RowActions } from "./row-actions";

interface GetColumnsProps {
  data: ProductQueryResult[];
}

const statusFilterFn: FilterFn<ProductQueryResult> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

export const getColumns = ({ data }: GetColumnsProps): ColumnDef<ProductQueryResult>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }) => (
      <Link href={`/studio/products/${row.original.id}`}>
        <div className="flex items-center gap-3">
          <Image alt={row.getValue("title")} className="rounded-full" height={32} src={row.original.image} width={32} />
          <div className="font-medium">{row.getValue("title")}</div>
        </div>
      </Link>
    ),
    size: 180,
    enableHiding: false,
  },

  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <div className="flex h-full items-center">
        <Badge
          className={cn(
            "capitalize",
            row.original.status === "published" ? "text-muted-foreground" : "text-primary-foreground"
          )}
          size="sm"
          variant="outline"
        >
          {row.original.status === "published" && (
            <RiCheckLine aria-hidden="true" className="text-emerald-500" size={14} />
          )}
          {row.original.status === "expired" && "- "}
          {row.original.status}
        </Badge>
      </div>
    ),
    size: 70,
    filterFn: statusFilterFn,
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-muted-foreground">
        <IconCurrency className="size-3" /> {row.getValue("price")}
      </span>
    ),
    size: 60,
  },

  {
    header: "Stock",
    accessorKey: "inventory",
    cell: ({ row }) => {
      const stock = row.original.inventory.stock;
      const initialStock = row.original.inventory.initialStock;

      const percentage = (stock / initialStock) * 100;
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full items-center">
                <Progress className="h-1 max-w-14" value={percentage} />
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" sideOffset={-10}>
              <p>{stock === initialStock ? "All" : `${stock} of ${initialStock}`} in stock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 80,
  },
  {
    header: "Schedule",
    accessorKey: "schedule",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm">
        {row.original.schedule &&
          formatDate(row.original.schedule, {
            includeTime: true,
          })}
      </div>
    ),
    size: 80,
  },
  {
    header: "Offer Ends At",
    accessorKey: "endsIn",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm">
        {row.original.endsIn &&
          formatDate(row.original.endsIn, {
            includeTime: true,
          })}
      </div>
    ),
    size: 80,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions data={data} item={row.original} />,
    size: 60,
    enableHiding: false,
  },
];
