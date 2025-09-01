"use client";

import { useState } from "react";
import Link from "next/link";

import { format } from "date-fns";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { deleteComboDeal, toggleComboDealStatus } from "../actions/mutation";
import type { ComboDealTableData } from "../types";

interface ComboDealsDataTableProps {
  data: ComboDealTableData[];
}

export function ComboDealsDataTable({ data }: ComboDealsDataTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this combo deal? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        const result = await deleteComboDeal({ id });
        if (!result.success) {
          console.error(result.message);
        } else {
          // Refresh the page to show updated data
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to delete combo deal", error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIsToggling(id);
    try {
      const result = await toggleComboDealStatus(id);
      if (!result.success) {
        console.error(result.message);
      } else {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle combo deal status", error);
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Original Price</TableHead>
            <TableHead>Combo Price</TableHead>
            <TableHead>Savings</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((comboDeal) => (
            <TableRow key={comboDeal.id}>
              <TableCell className="font-medium">{comboDeal.title}</TableCell>
              <TableCell className="font-mono text-sm">{comboDeal.slug}</TableCell>
              <TableCell>${comboDeal.originalPrice}</TableCell>
              <TableCell>${comboDeal.comboPrice}</TableCell>
              <TableCell>${comboDeal.savings}</TableCell>
              <TableCell>{comboDeal.productCount}</TableCell>
              <TableCell>{comboDeal.imageCount}</TableCell>
              <TableCell>
                <Badge variant={comboDeal.isActive ? "default" : "secondary"}>
                  {comboDeal.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={comboDeal.isFeatured ? "default" : "outline"}>
                  {comboDeal.isFeatured ? "Featured" : "Not Featured"}
                </Badge>
              </TableCell>
              <TableCell>{format(comboDeal.createdAt, "MMM dd, yyyy")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/studio/products/combo/${comboDeal.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/studio/products/combo/${comboDeal.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={isToggling === comboDeal.id}
                      onClick={() => handleToggleStatus(comboDeal.id)}
                    >
                      {comboDeal.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={isDeleting === comboDeal.id}
                      onClick={() => handleDelete(comboDeal.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
