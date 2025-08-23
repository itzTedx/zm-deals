import Image from "next/image";

import { RiCheckLine } from "@remixicon/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { IconCurrency } from "@/assets/icons/currency";

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
      <div className="flex items-center gap-3">
        <Image alt={row.getValue("title")} className="rounded-full" height={32} src={row.original.image} width={32} />
        <div className="font-medium">{row.getValue("title")}</div>
      </div>
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
    size: 110,
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
    size: 140,
  },
  //   {
  //     header: "Verified",
  //     accessorKey: "verified",
  //     cell: ({ row }) => (
  //       <div>
  //         <span className="sr-only">{row.original.verified ? "Verified" : "Not Verified"}</span>
  //         <RiVerifiedBadgeFill
  //           aria-hidden="true"
  //           className={cn(row.original.verified ? "fill-emerald-600" : "fill-muted-foreground/50")}
  //           size={20}
  //         />
  //       </div>
  //     ),
  //     size: 90,
  //   },
  //   {
  //     header: "Referral",
  //     accessorKey: "referral",
  //     cell: ({ row }) => (
  //       <div className="flex items-center gap-3">
  //         <img
  //           alt={row.original.referral.name}
  //           className="rounded-full"
  //           height={20}
  //           src={row.original.referral.image}
  //           width={20}
  //         />
  //         <div className="text-muted-foreground">{row.original.referral.name}</div>
  //       </div>
  //     ),
  //     size: 140,
  //   },
  {
    header: "Stock",
    accessorKey: "inventory",
    cell: ({ row }) => {
      const stock = row.getValue("inventory") as number;
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full items-center">
                <Progress className="h-1 max-w-14" value={stock} />
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" sideOffset={-8}>
              <p>{stock}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
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
