"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/agents/discovery", label: "Agent 1 — Discovery" },
  { href: "/dashboard/agents/outreach", label: "Agent 2 — Outreach" },
  { href: "/dashboard/agents/booking", label: "Agent 3 — Booking" },
  { href: "/dashboard/contracts", label: "Contracts" },
  { href: "/dashboard/admin", label: "Admin — API Usage" },
];

export function DashboardSidebar({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <span className="mark" />
        <span>StarSource</span>
      </div>
      <nav className="dash-nav">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-link ${active ? "active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="dash-sidebar-foot">
        {email && <span className="dash-session-email" title={email}>{email}</span>}
        <span className="dash-nav-link disabled">Settings</span>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="dash-nav-link dash-signout">
            Sign out
          </button>
        </form>
        <Link href="/" className="dash-back">
          ← Marketing site
        </Link>
      </div>
    </aside>
  );
}
