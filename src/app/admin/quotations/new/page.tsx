"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { QuotationEditor } from "@/components/admin/QuotationEditor";

function NewQuotationInner() {
  const params = useSearchParams();
  return (
    <div>
      <PageHeader title="New Quotation" description="Build an itemized quotation for a customer." />
      <QuotationEditor
        initial={{
          customerId: params.get("customerId") || undefined,
          projectName: params.get("projectName") || undefined,
          projectLocation: params.get("projectLocation") || undefined,
          projectDescription: params.get("projectDescription") || undefined,
          sourceQuoteRequestId: params.get("sourceQuoteRequestId") || undefined,
        }}
      />
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-steel">Loading…</div>}>
      <NewQuotationInner />
    </Suspense>
  );
}
