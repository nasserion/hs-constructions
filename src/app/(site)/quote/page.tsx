"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Button, LinkButton } from "@/components/ui/Button";
import { db, seedIfEmpty, uid } from "@/lib/store";
import { waLink } from "@/lib/business";
import type { QuoteRequest } from "@/lib/types";

const PROJECT_TYPES = [
  "Residential construction",
  "Commercial building",
  "Renovation / remodeling",
  "Structural / civil works",
  "Site survey",
  "Engineering consultation",
  "Other",
];

function makeReference() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HSC-Q-${new Date().getFullYear()}-${rand}`;
}

export default function QuotePage() {
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const fullName = String(data.get("fullName") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const description = String(data.get("description") || "").trim();
    const serviceRequired = String(data.get("serviceRequired") || "").trim();
    const projectType = String(data.get("projectType") || "").trim();

    if (!fullName || !phone || !description || !serviceRequired || !projectType) {
      setError("Please fill in your name, phone, project type, service required and a short description.");
      return;
    }

    setSubmitting(true);
    seedIfEmpty();

    const ref = makeReference();
    const request: QuoteRequest = {
      id: uid(),
      reference: ref,
      fullName,
      phone,
      email: String(data.get("email") || "") || undefined,
      projectType,
      serviceRequired,
      projectLocation: String(data.get("projectLocation") || "") || undefined,
      estimatedSize: String(data.get("estimatedSize") || "") || undefined,
      description,
      preferredStartDate: String(data.get("preferredStartDate") || "") || undefined,
      budgetRange: String(data.get("budgetRange") || "") || undefined,
      additionalNotes:
        (String(data.get("additionalNotes") || "") || "") +
        (fileNames.length ? `\n\nAttachments noted by customer: ${fileNames.join(", ")}` : ""),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    // Simulate submission latency for a realistic loading state.
    await new Promise((r) => setTimeout(r, 500));
    db.quoteRequests.upsert(request);
    setReference(ref);
    setSubmitting(false);
  }

  if (reference) {
    return (
      <section className="py-24">
        <Container className="max-w-xl text-center">
          <CheckCircle2 size={48} className="mx-auto text-good" />
          <h1 className="font-display font-semibold text-4xl mt-5">Quote request received</h1>
          <p className="mt-3 text-steel leading-relaxed">
            Thank you — your request has been saved with reference{" "}
            <span className="font-semibold text-ink">{reference}</span>. Our team will review it
            and get back to you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href={waLink(`Hello H S Constructions, I just submitted a quote request (ref: ${reference}). I'd like to follow up.`)} target="_blank">
              Follow up on WhatsApp
            </LinkButton>
            <LinkButton href="/" variant="outline">
              Back to Home
            </LinkButton>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      <section className="bg-ink text-white py-16 sm:py-20">
        <Container>
          <p className="text-rust font-medium text-sm mb-3">Request a Quote</p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl max-w-2xl">
            Tell us about your project
          </h1>
          <p className="mt-5 text-steel-light max-w-xl">
            Share your project details below and our team will prepare a quotation for your
            review.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {error && (
              <div role="alert" className="border border-bad/40 bg-bad/5 text-bad text-sm px-4 py-3 rounded-sm">
                {error}
              </div>
            )}

            <fieldset className="grid sm:grid-cols-2 gap-6">
              <Field label="Full name" name="fullName" required />
              <Field label="Phone number" name="phone" type="tel" required />
              <Field label="Email" name="email" type="email" />
              <Field label="Project location" name="projectLocation" />
            </fieldset>

            <fieldset className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="projectType">
                  Project type <span className="text-rust">*</span>
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  required
                  defaultValue=""
                  className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
                >
                  <option value="" disabled>
                    Select project type
                  </option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Service required" name="serviceRequired" required placeholder="e.g. Building construction" />
              <Field label="Estimated project size" name="estimatedSize" placeholder="e.g. 3 bedroom house, 200 sqm" />
              <Field label="Preferred start date" name="preferredStartDate" type="date" />
            </fieldset>

            <div>
              <label className="text-sm font-medium text-ink" htmlFor="budgetRange">
                Budget range
              </label>
              <input
                id="budgetRange"
                name="budgetRange"
                placeholder="e.g. UGX 20,000,000 – 40,000,000"
                className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink" htmlFor="description">
                Project description <span className="text-rust">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
                placeholder="Describe what you need built, renovated or surveyed."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink" htmlFor="additionalNotes">
                Additional notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                rows={3}
                className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink flex items-center gap-2" htmlFor="attachments">
                <Paperclip size={15} /> Project documents / photos
              </label>
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setFileNames(Array.from(e.target.files || []).map((f) => f.name))}
                className="mt-2 w-full text-sm text-steel file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-ink file:text-white hover:file:bg-ink-soft file:rounded-sm"
              />
              <p className="mt-1.5 text-xs text-steel">
                File names are noted with your request. Actual file upload will be enabled once a
                backend is connected.
              </p>
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Submitting…" : "Submit Quote Request"}
            </Button>
          </form>
        </Container>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={name}>
        {label} {required && <span className="text-rust">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
      />
    </div>
  );
}
