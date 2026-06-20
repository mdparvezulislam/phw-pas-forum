"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is BHW PAS?",
    a: "BHW PAS is a modern community platform for entrepreneurs, marketers, developers, and digital professionals. It combines forums, a marketplace, reputation systems, premium memberships, and learning resources into one integrated ecosystem.",
  },
  {
    q: "How does the marketplace work?",
    a: "Our marketplace connects buyers and sellers of digital services. Sellers create listings with packages, buyers place orders, and payments are held securely. The platform includes dispute resolution, buyer protection, and a verified seller program.",
  },
  {
    q: "How do VIP memberships work?",
    a: "VIP memberships unlock premium features including access to VIP-only forums, premium resource downloads, marketplace listing boosts, priority support, and increased private message limits. Plans are available monthly or yearly.",
  },
  {
    q: "How does the trust and reputation system work?",
    a: "Every user earns reputation points through quality contributions. Badges and trophies recognize achievements. Sellers can get verified, and our iTrader system provides transparent feedback for marketplace transactions.",
  },
  {
    q: "How do sellers get verified?",
    a: "Sellers can apply for verification by providing identity documents and demonstrating their expertise. Verified sellers get a badge, higher visibility in search results, and increased trust from buyers.",
  },
  {
    q: "Is there buyer protection?",
    a: "Yes. Our escrow system holds payments until the buyer confirms satisfaction. If there's a dispute, our moderation team reviews the case and can issue refunds. We also have seller reviews and iTrader ratings to help you make informed decisions.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about the platform
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="overflow-hidden rounded-xl border border-border"
            >
              <button
                onClick={() => setOpen(open === faq.q ? null : faq.q)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-accent"
              >
                {faq.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    open === faq.q ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === faq.q && (
                <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
