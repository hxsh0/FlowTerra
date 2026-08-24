import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export default function BookingAgentPage() {
  return (
    <>
      <DashboardTopbar title="Agent 3 — Booking" />
      <div className="dash-content">
        <div className="dash-empty">
          <span className="dash-pill">Premium</span>
          <h2>Booking agent coming soon</h2>
          <p>
            Agent 3 handles calendar routing, no-show recovery, and CRM sync — available on
            Premium plans.
          </p>
          <Link href="/dashboard" className="btn btn-ghost">
            ← Back to overview
          </Link>
        </div>
      </div>
    </>
  );
}
