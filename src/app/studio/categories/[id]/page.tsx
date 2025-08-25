import { isAdmin } from "@/lib/auth/permissions";

type Params = Promise<{ id: string }>;

export default async function CategoryPage({ params }: { params: Params }) {
  await isAdmin();
  const { id } = await params;

  const isEditMode = id !== "create";

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pt-4 pb-12">CategoryPage</div>;
}
