const testimonials = [
  {
    quote:
      "This platform completely transformed how I connect with clients. I went from zero to full-time freelancer in 3 months.",
    author: "Alex Chen",
    role: "SEO Specialist",
    badge: "Top Seller",
  },
  {
    quote:
      "The VIP membership paid for itself within the first week. Premium forums alone are worth the investment.",
    author: "Sarah Mitchell",
    role: "Digital Marketer",
    badge: "VIP Member",
  },
  {
    quote:
      "I've been on BHW for years — this new platform takes everything great and makes it 10x better. The trust system is a game-changer.",
    author: "Marcus Johnson",
    role: "Agency Owner",
    badge: "Verified Seller",
  },
  {
    quote:
      "The community here is unmatched. I've learned more in 2 months than I did in 2 years on other platforms.",
    author: "Priya Sharma",
    role: "AI Developer",
    badge: "Top Contributor",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Trusted by the Community</h2>
          <p className="mt-3 text-muted-foreground">
            Hear from our members, sellers, and partners
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 fill-amber-500"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {t.author[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="ml-auto rounded-full bg-premium/10 px-2.5 py-0.5 text-[10px] font-medium text-premium">
                  {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
