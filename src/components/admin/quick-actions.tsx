import { Route } from "next";
import Link from "next/link";

import { Package, PackageIcon, Plus, ShoppingCart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: Route;
  variant?: "default" | "outline" | "secondary";
}

function QuickAction({ title, description, icon, href, variant = "outline" }: QuickActionProps) {
  return (
    <Button asChild className="h-auto justify-start p-4" variant={variant}>
      <Link href={href}>
        <div className="flex items-center space-x-3">
          {icon}
          <div className="text-left">
            <div className="font-medium">{title}</div>
            <div className="text-muted-foreground text-xs">{description}</div>
          </div>
        </div>
      </Link>
    </Button>
  );
}

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common admin tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <QuickAction
          description="Create a new product listing"
          href={"/studio/products/create" as Route}
          icon={<Plus className="h-5 w-5" />}
          title="Add Product"
          variant="default"
        />

        <QuickAction
          description="Create a new combo deal"
          href="/studio/products/combo/create"
          icon={<PackageIcon className="h-5 w-5" />}
          title="Add Combo Deal"
        />

        <QuickAction
          description="View and process customer orders"
          href="/studio/orders"
          icon={<ShoppingCart className="h-5 w-5" />}
          title="Manage Orders"
        />

        <QuickAction
          description="Manage customer accounts and permissions"
          href="/studio/users"
          icon={<Users className="h-5 w-5" />}
          title="User Management"
        />

        <QuickAction
          description="Edit existing products and inventory"
          href="/studio/products"
          icon={<Package className="h-5 w-5" />}
          title="Product Catalog"
        />

        <QuickAction
          description="Manage combo deals and bundles"
          href="/studio/products/combo"
          icon={<PackageIcon className="h-5 w-5" />}
          title="Combo Deals"
        />
      </CardContent>
    </Card>
  );
}
