import { Suspense } from "react";

import { UsersRoundIcon } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { getAllUsers } from "@/modules/users/actions/query";
import { UsersDataTable } from "@/modules/users/components/table";

async function UsersTable() {
  const result = await getAllUsers();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="font-semibold text-destructive text-lg">Error Loading Users</p>
          <p className="text-muted-foreground text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  return <UsersDataTable data={result.users || []} />;
}

export default function UsersPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersRoundIcon className="h-6 w-6" />
            <h1 className="font-bold text-2xl">Users</h1>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <UsersTable />
        </Suspense>
      </div>
    </main>
  );
}
