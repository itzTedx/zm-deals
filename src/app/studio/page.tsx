import { isAdmin } from "@/lib/auth/permissions";

export default async function StudioPage() {
  await isAdmin();

  return <div>StudioPage</div>;
}
