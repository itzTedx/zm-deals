import { Route } from "next";
import Link from "next/link";

import { PackageIcon, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: Route;
  variant?: "default" | "outline" | "secondary";
}

function QuickAction({ title, description, icon, href, variant = "outline" }: QuickActionProps) {
  return (
    <Button asChild className="h-auto justify-start p-3" variant={variant}>
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
    <Card className="md:p-0.5">
      <CardContent className="h-full space-y-3.5 p-4">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
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
      </CardContent>
    </Card>
  );
}
