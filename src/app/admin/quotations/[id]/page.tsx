"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { db } from "@/lib/store";
import type { Quotation } from "@/lib/types";

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<Quotation | null | undefined>(undefined);

  useEffect(() => {
    setQuotation(db.quotations.get(id));
  }, [id]);

  if (quotation === undefined) return <div className="p-6 text-sm text-steel">Loading…</div>;
  if (!quotation) return <div className="p-6 text-sm text-steel">Quotation not found.</div>;

  return (
    <div>
      <PageHeader title={quotation.number} description="Edit this quotation." />
      <QuotationEditor existing={quotation} />
    </div>
  );
}
