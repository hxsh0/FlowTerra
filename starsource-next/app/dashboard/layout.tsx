import { DashboardProvider } from "@/lib/dashboard-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="dash-shell">
        <DashboardSidebar />
        <main className="dash-main">{children}</main>
      </div>
    </DashboardProvider>
  );
}
