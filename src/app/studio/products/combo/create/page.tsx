import { isAdmin } from "@/lib/auth/permissions";
import { ComboDealForm } from "@/modules/combo-deals/components/combo-deal-form";

export default async function CreateComboDealPage() {
  await isAdmin();

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold text-2xl">Create Combo Deal</h1>
      </div>
      <ComboDealForm />
    </div>
  );
}
