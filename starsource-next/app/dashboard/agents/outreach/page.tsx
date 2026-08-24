import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export default function OutreachAgentPage() {
  return (
    <>
      <DashboardTopbar title="Agent 2 — Outreach" />
      <div className="dash-content">
        <div className="dash-empty">
          <h2>Outreach agent coming soon</h2>
          <p>
            Agent 2 will orchestrate multi-channel sequences, reply detection, and meeting
            handoff — wired to your ICP-scored leads from Discovery.
          </p>
          <Link href="/dashboard" className="btn btn-ghost">
            ← Back to overview
          </Link>
        </div>
      </div>
    </>
  );
}
