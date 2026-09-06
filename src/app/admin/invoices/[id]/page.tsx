"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { db } from "@/lib/store";
import type { Invoice } from "@/lib/types";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => setInvoice(db.invoices.get(id)), [id]);

  if (invoice === undefined) return <div className="p-6 text-sm text-steel">Loading…</div>;
  if (!invoice) return <div className="p-6 text-sm text-steel">Invoice not found.</div>;

  return (
    <div>
      <PageHeader title={invoice.number} description="Edit this invoice." />
      <InvoiceEditor existing={invoice} />
    </div>
  );
}
