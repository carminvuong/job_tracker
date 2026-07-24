import { desc } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { DashboardClient } from "@/components/dashboard-client";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allApplications = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">jobs + internships</h1>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Log out
          </Button>
        </form>
      </div>
      <DashboardClient applications={allApplications} />
    </div>
  );
}
