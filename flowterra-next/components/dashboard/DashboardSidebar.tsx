"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/agents/discovery", label: "Agent 1 — Discovery" },
  { href: "/dashboard/agents/outreach", label: "Agent 2 — Outreach", disabled: true },
  { href: "/dashboard/agents/booking", label: "Agent 3 — Booking", premium: true, disabled: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <span className="mark" />
        <span>FlowTerra</span>
      </div>
      <nav className="dash-nav">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          if (item.disabled) {
            return (
              <span key={item.href} className="dash-nav-link disabled">
                {item.label}
                {item.premium && <span className="dash-pill">Premium</span>}
              </span>
            );
          }
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
        <span className="dash-nav-link disabled">Settings</span>
        <Link href="/" className="dash-back">
          ← Marketing site
        </Link>
      </div>
    </aside>
  );
}
