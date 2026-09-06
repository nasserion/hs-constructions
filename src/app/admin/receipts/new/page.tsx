"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { ReceiptEditor } from "@/components/admin/ReceiptEditor";

export default function NewReceiptPage() {
  return (
    <div>
      <PageHeader title="New Receipt" description="Record a payment received from a customer." />
      <ReceiptEditor />
    </div>
  );
}
