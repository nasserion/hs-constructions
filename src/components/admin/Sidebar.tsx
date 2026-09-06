"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  Receipt as ReceiptIcon,
  Calculator,
  Users,
  FolderKanban,
  HardHat,
  Package,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/quote-requests", label: "Quote Requests", icon: Inbox },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/receipts", label: "Receipts", icon: ReceiptIcon },
  { href: "/admin/estimates", label: "Estimates", icon: Calculator },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/portfolio", label: "Website Projects", icon: FolderKanban },
  { href: "/admin/workforce", label: "Workforce", icon: HardHat },
  { href: "/admin/materials", label: "Materials", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  const content = (
    <>
      <div className="px-5 py-6 border-b border-line-dark">
        <span className="font-display font-semibold text-xl text-white">
          H S <span className="text-rust">ADMIN</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                active ? "bg-rust/15 text-rust border-r-2 border-rust" : "text-steel-light hover:text-white"
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line-dark p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-2 py-2.5 text-sm text-steel-light hover:text-white"
        >
          <ExternalLink size={17} /> View public site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2.5 text-sm text-steel-light hover:text-rust"
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-ink min-h-screen sticky top-0">
        {content}
      </aside>

      <div className="lg:hidden flex items-center justify-between bg-ink text-white px-4 py-3 sticky top-0 z-40">
        <span className="font-display font-semibold text-lg">
          H S <span className="text-rust">ADMIN</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={26} className="text-white" />
            </button>
          </div>
          <div className="flex-1 flex flex-col">{content}</div>
        </div>
      )}
    </>
  );
}
