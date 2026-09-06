"use client";

import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/business";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with H S Constructions on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle size={28} fill="currentColor" className="text-white" />
    </a>
  );
}
