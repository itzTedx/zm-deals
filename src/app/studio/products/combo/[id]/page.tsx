import Link from "next/link";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { isAdmin } from "@/lib/auth/permissions";
import { getComboDeal } from "@/modules/combo-deals/actions/query";

interface ComboDealPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComboDealPage({ params }: ComboDealPageProps) {
  await isAdmin();
  const { id } = await params;
  const comboDeal = await getComboDeal(id);

  if (!comboDeal) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="font-semibold text-destructive text-lg">Combo Deal Not Found</p>
          <p className="text-muted-foreground text-sm">The combo deal you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold text-2xl">{comboDeal.title}</h1>
        <Button asChild size="sm">
          <Link href={`/studio/products/combo/${id}/edit`}>Edit Combo Deal</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-muted-foreground text-sm">Title</h4>
              <p>{comboDeal.title}</p>
            </div>

            {comboDeal.description && (
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Description</h4>
                <p>{comboDeal.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-muted-foreground text-sm">Slug</h4>
              <p className="font-mono text-sm">{comboDeal.slug}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Original Price</h4>
                <p className="font-semibold text-lg">${comboDeal.originalPrice}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Combo Price</h4>
                <p className="font-semibold text-green-600 text-lg">${comboDeal.comboPrice}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Savings</h4>
                <p className="font-semibold text-lg text-red-600">${comboDeal.savings}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant={comboDeal.isActive ? "default" : "secondary"}>
                  {comboDeal.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={comboDeal.isFeatured ? "default" : "outline"}>
                  {comboDeal.isFeatured ? "Featured" : "Not Featured"}
                </Badge>
              </div>
            </div>

            {comboDeal.maxQuantity && (
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Max Quantity</h4>
                <p>{comboDeal.maxQuantity}</p>
              </div>
            )}

            {comboDeal.startsAt && (
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">Start Date</h4>
                <p>{format(comboDeal.startsAt, "PPP")}</p>
              </div>
            )}

            {comboDeal.endsAt && (
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">End Date</h4>
                <p>{format(comboDeal.endsAt, "PPP")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products ({comboDeal.products.length})</CardTitle>
            <CardDescription>Products included in this combo deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comboDeal.products
              .filter((cp) => cp.product)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((comboProduct) => (
                <div className="flex items-center space-x-4 rounded-lg border p-4" key={comboProduct.id}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{comboProduct.product?.title}</h4>
                      <Badge variant="outline">${comboProduct.product?.price}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Qty: {comboProduct.quantity} | Sort Order: {comboProduct.sortOrder || 0}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-muted-foreground text-sm">Created</h4>
              <p>{format(comboDeal.createdAt, "PPP 'at' p")}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground text-sm">Last Updated</h4>
              <p>{format(comboDeal.updatedAt, "PPP 'at' p")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
