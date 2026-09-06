"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReceiptEditor } from "@/components/admin/ReceiptEditor";
import { db } from "@/lib/store";
import type { Receipt } from "@/lib/types";

export default function EditReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null | undefined>(undefined);

  useEffect(() => setReceipt(db.receipts.get(id)), [id]);

  if (receipt === undefined) return <div className="p-6 text-sm text-steel">Loading…</div>;
  if (!receipt) return <div className="p-6 text-sm text-steel">Receipt not found.</div>;

  return (
    <div>
      <PageHeader title={receipt.number} description="Edit this receipt." />
      <ReceiptEditor existing={receipt} />
    </div>
  );
}
