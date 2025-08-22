import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Add Product</h1>
          <Button size="sm">Save Product</Button>
        </div>
        <Card>
          <CardContent>Hello</CardContent>
        </Card>
      </div>
    </main>
  );
}
