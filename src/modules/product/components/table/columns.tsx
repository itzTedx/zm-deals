import Image from "next/image";
import Link from "next/link";

import { RiCheckLine } from "@remixicon/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StarRating from "@/components/ui/rating";
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
    header: "Title",
    accessorKey: "title",
    cell: ({ row }) => {
      const image = row.original.images.find((image) => image.isFeatured);
      return (
        <Link href={`/studio/products/${row.original.id}`}>
          <div className="flex items-center gap-3">
            {image?.media?.url && (
              <Image
                alt={row.getValue("title")}
                blurDataURL={image.media.blurData ?? undefined}
                className="rounded border"
                height={48}
                placeholder={image.media.blurData ? "blur" : "empty"}
                src={image.media.url}
                width={48}
              />
            )}
            <div className="font-medium">{row.getValue("title")}</div>
          </div>
        </Link>
      );
    },
    size: 360,
    enableHiding: false,
    enablePinning: true,
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
    size: 100,
    filterFn: statusFilterFn,
    enablePinning: false,
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-muted-foreground">
        <IconCurrency className="size-3 shrink-0" /> {row.getValue("price")}
      </span>
    ),
    size: 100,
    enablePinning: false,
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
    size: 100,
    enablePinning: false,
  },
  {
    header: "Schedule",
    accessorKey: "schedule",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm">
        {row.original.schedule &&
          formatDate(row.original.schedule, {
            includeTime: true,
            showDayOfWeek: false,
            showYear: false,
          })}
      </div>
    ),
    size: 180,
    enablePinning: false,
  },
  {
    header: "Offer Ends At",
    accessorKey: "endsIn",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm">
        {row.original.endsIn &&
          formatDate(row.original.endsIn, {
            includeTime: true,
            showYear: false,
          })}
      </div>
    ),
    size: 180,
    enablePinning: false,
  },
  {
    header: "Reviews",
    accessorKey: "reviews",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <StarRating readOnly value={row.original.reviews?.length ?? 0} />
          </TooltipTrigger>
          <TooltipContent align="center">
            <p>{row.original.reviews?.length} reviews</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    size: 180,
    enablePinning: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions data={data} item={row.original} />,
    size: 60,
    enableHiding: false,
    enablePinning: false,
  },
];
