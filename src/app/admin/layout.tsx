"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/store";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    seedIfEmpty();
    if (!isLoginPage && !isAuthed()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-steel-light text-sm">
        Loading admin portal…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-paper-dim">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
