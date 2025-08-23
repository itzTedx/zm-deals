import { RiCheckLine, RiVerifiedBadgeFill } from "@remixicon/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { Item } from "./data-table";
import { RowActions } from "./row-actions";

interface GetColumnsProps {
  data: Item[];
  setData: React.Dispatch<React.SetStateAction<Item[]>>;
}

const statusFilterFn: FilterFn<Item> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

export const getColumns = ({ data, setData }: GetColumnsProps): ColumnDef<Item>[] => [
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
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img alt={row.getValue("name")} className="rounded-full" height={32} src={row.original.image} width={32} />
        <div className="font-medium">{row.getValue("name")}</div>
      </div>
    ),
    size: 180,
    enableHiding: false,
  },
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("id")}</span>,
    size: 110,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <div className="flex h-full items-center">
        <Badge
          className={cn(
            "gap-1 px-2 py-0.5 text-sm",
            row.original.status === "Inactive" ? "text-muted-foreground" : "text-primary-foreground"
          )}
          variant="outline"
        >
          {row.original.status === "Active" && (
            <RiCheckLine aria-hidden="true" className="text-emerald-500" size={14} />
          )}
          {row.original.status === "Inactive" && "- "}
          {row.original.status}
        </Badge>
      </div>
    ),
    size: 110,
    filterFn: statusFilterFn,
  },
  {
    header: "Location",
    accessorKey: "location",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("location")}</span>,
    size: 140,
  },
  {
    header: "Verified",
    accessorKey: "verified",
    cell: ({ row }) => (
      <div>
        <span className="sr-only">{row.original.verified ? "Verified" : "Not Verified"}</span>
        <RiVerifiedBadgeFill
          aria-hidden="true"
          className={cn(row.original.verified ? "fill-emerald-600" : "fill-muted-foreground/50")}
          size={20}
        />
      </div>
    ),
    size: 90,
  },
  {
    header: "Referral",
    accessorKey: "referral",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          alt={row.original.referral.name}
          className="rounded-full"
          height={20}
          src={row.original.referral.image}
          width={20}
        />
        <div className="text-muted-foreground">{row.original.referral.name}</div>
      </div>
    ),
    size: 140,
  },
  {
    header: "Value",
    accessorKey: "value",
    cell: ({ row }) => {
      const value = row.getValue("value") as number;
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full items-center">
                <Progress className="h-1 max-w-14" value={value} />
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" sideOffset={-8}>
              <p>{value}%</p>
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
    cell: ({ row }) => <RowActions data={data} item={row.original} setData={setData} />,
    size: 60,
    enableHiding: false,
  },
];
