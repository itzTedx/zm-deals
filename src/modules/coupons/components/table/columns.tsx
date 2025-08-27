import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { format } from "date-fns";
import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { formatDate } from "@/lib/functions/format-date";
import type { Coupon } from "@/server/schema";

import { RowActions } from "./row-actions";

// Custom filter function for status
const statusFilterFn: FilterFn<Coupon> = (row, filterValue: string) => {
  if (!filterValue || filterValue === "all") return true;

  const coupon = row.original;
  const now = new Date();

  switch (filterValue) {
    case "active":
      return (
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.endDate &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      );
    case "inactive":
      return !coupon.isActive;
    case "expired":
      return now > coupon.endDate;
    case "upcoming":
      return now < coupon.startDate;
    default:
      return true;
  }
};

interface GetColumnsProps {
  data: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => Promise<void>;
  isDeleting: string | null;
}

export const getColumns = ({ data, onEdit, onDelete, isDeleting }: GetColumnsProps): ColumnDef<Coupon>[] => [
  {
    header: "Code",
    accessorKey: "code",
    cell: ({ row }) => {
      const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
      };

      return (
        <div className="flex items-center gap-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {row.getValue("code")}
          </code>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(row.getValue("code"))}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {row.original.description && <p className="mt-1 text-muted-foreground text-xs">{row.original.description}</p>}
        </div>
      );
    },
    size: 200,
    enableHiding: false,
  },
  {
    header: "Discount",
    accessorKey: "discountValue",
    cell: ({ row }) => {
      const formatDiscount = (coupon: Coupon) => {
        if (coupon.discountType === "percentage") {
          return `${coupon.discountValue}%`;
        }
        return `$${coupon.discountValue}`;
      };

      return (
        <div>
          <div className="font-medium">{formatDiscount(row.original)}</div>
          {row.original.discountType === "percentage" && row.original.maxDiscount && (
            <div className="text-muted-foreground text-xs">Max: ${row.original.maxDiscount}</div>
          )}
        </div>
      );
    },
    size: 120,
  },
  {
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }) => {
      const getStatusBadge = (coupon: Coupon) => {
        const now = new Date();

        if (!coupon.isActive) {
          return <Badge variant="secondary">Inactive</Badge>;
        }

        if (now < coupon.startDate) {
          return <Badge variant="outline">Upcoming</Badge>;
        }

        if (now > coupon.endDate) {
          return <Badge variant="destructive">Expired</Badge>;
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return <Badge variant="destructive">Limit Reached</Badge>;
        }

        return <Badge variant="default">Active</Badge>;
      };

      return getStatusBadge(row.original);
    },
    size: 120,
    filterFn: statusFilterFn,
  },
  {
    header: "Usage",
    accessorKey: "usedCount",
    cell: ({ row }) => {
      const getUsageText = (coupon: Coupon) => {
        if (coupon.usageLimit) {
          return `${coupon.usedCount}/${coupon.usageLimit}`;
        }
        return `${coupon.usedCount} uses`;
      };

      return <div className="text-sm">{getUsageText(row.original)}</div>;
    },
    size: 100,
  },
  {
    header: "Valid Period",
    accessorKey: "startDate",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{format(row.original.startDate, "MMM dd, yyyy")}</div>
        <div className="text-muted-foreground">to</div>
        <div>{format(row.original.endDate, "MMM dd, yyyy")}</div>
      </div>
    ),
    size: 200,
  },
  {
    header: "Min Order",
    accessorKey: "minOrderAmount",
    cell: ({ row }) => (
      <div>
        {row.original.minOrderAmount ? (
          <span className="text-sm">${row.original.minOrderAmount}</span>
        ) : (
          <span className="text-muted-foreground text-sm">No minimum</span>
        )}
      </div>
    ),
    size: 120,
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div>
        <span className="text-sm">
          {formatDate(row.original.createdAt, {
            includeTime: true,
          })}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions data={data} isDeleting={isDeleting} item={row.original} onDelete={onDelete} onEdit={onEdit} />
    ),
    size: 100,
    enableHiding: false,
  },
];
