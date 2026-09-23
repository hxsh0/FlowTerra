import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { DashboardProvider } from "@/lib/dashboard-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) redirect("/login");

  return (
    <DashboardProvider>
      <div className="dash-shell">
        <DashboardSidebar email={session.email} />
        <main className="dash-main">{children}</main>
      </div>
    </DashboardProvider>
  );
}
