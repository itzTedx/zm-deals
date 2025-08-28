import { isAdmin } from "@/lib/auth/permissions";
import { getComboDeal } from "@/modules/combo-deals/actions/query";
import { ComboDealForm } from "@/modules/combo-deals/components/combo-deal-form";

interface EditComboDealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditComboDealPage({ params }: EditComboDealPageProps) {
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
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold text-2xl">Edit Combo Deal</h1>
      </div>
      <ComboDealForm initialData={comboDeal} isEditMode />
    </div>
  );
}
