import { isAdmin } from "@/lib/auth/permissions";

export default async function StudioPage() {
  await isAdmin();

  return (
    <main>
      <p className="pt-1 text-center text-muted-foreground text-xs">Content for Tab 1</p>
    </main>
  );
}
