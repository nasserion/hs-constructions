"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";

export default function NewInvoicePage() {
  return (
    <div>
      <PageHeader title="New Invoice" description="Bill a customer for completed or in-progress work." />
      <InvoiceEditor />
    </div>
  );
}
