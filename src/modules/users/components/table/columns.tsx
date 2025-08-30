"use client";

import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { UserData } from "../../actions/query";

export const getColumns = (): ColumnDef<UserData>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          {user.image && (
            <Image
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
              height={32}
              src={user.image}
              width={32}
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground text-sm">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <BadgeComponent variant={role === "admin" ? "default" : "secondary"}>{role || "user"}</BadgeComponent>;
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return (
        <BadgeComponent variant={verified ? "default" : "destructive"}>
          {verified ? "Verified" : "Unverified"}
        </BadgeComponent>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const banned = row.getValue("banned") as boolean;
      const isAnonymous = row.original.isAnonymous;

      if (banned) {
        return <BadgeComponent variant="destructive">Banned</BadgeComponent>;
      }

      if (isAnonymous) {
        return <BadgeComponent variant="outline">Anonymous</BadgeComponent>;
      }

      return <BadgeComponent variant="default">Active</BadgeComponent>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <span className="text-sm">{format(date, "MMM dd, yyyy")}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return <span className="text-sm">{format(date, "MMM dd, yyyy")}</span>;
    },
  },
];
