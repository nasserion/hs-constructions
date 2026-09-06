// Single source of truth for verified company facts.
// Do not add unverified details here (addresses, licenses, awards, project counts, etc.)
export const BUSINESS = {
  name: "H S Constructions",
  tagline: "Building your vision with strength, precision & quality",
  director: {
    name: "Senteza Hamuza",
    title: "Co-Founder / Director / Senior Engineer",
  },
  whatsapp: "+256776232483", // raw, for wa.me links
  whatsappDisplay: "+256 776 232 483",
  phone: "+256752232483", // raw, for tel: links
  phoneDisplay: "+256 752 232 483",
  // NOTE: the email provided ("hsconstructions.info") was not a complete address.
  // Using the corrected address supplied for this build — verify before publishing.
  email: "hsconstructions@company.com",
  workforce: {
    fundi: "50+",
    porters: "80+",
  },
  whatsappDefaultMessage:
    "Hello H S Constructions, I would like to enquire about your construction services.",
} as const;

export function waLink(message: string = BUSINESS.whatsappDefaultMessage) {
  return `https://wa.me/${BUSINESS.whatsapp.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export function telLink() {
  return `tel:${BUSINESS.phone}`;
}

export function mailLink(subject?: string) {
  return `mailto:${BUSINESS.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
