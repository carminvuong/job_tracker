import { desc } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { DashboardClient } from "@/components/dashboard-client";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demo = isDemoMode();
  const allApplications = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      {demo ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
          Demo mode - sample data, changes aren&apos;t saved...  Hopefully, this is a good enough demo on what the app does!
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">jobs + internships</h1>
        {demo ? null : (
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Log out
            </Button>
          </form>
        )}
      </div>
      <DashboardClient applications={allApplications} />
    </div>
  );
}
