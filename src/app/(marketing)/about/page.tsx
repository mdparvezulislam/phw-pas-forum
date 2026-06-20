import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold sm:text-5xl">About BHW PAS</h1>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We believe that the best opportunities come from community. Our platform brings together
              entrepreneurs, marketers, developers, and creators to share knowledge, collaborate on
              projects, and build thriving businesses.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              To be the world&apos;s most trusted platform for digital professionals — where
              reputation is earned, quality is rewarded, and everyone has the opportunity to
              learn, network, and earn.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Our Values</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Trust First", desc: "Every feature is built with trust and transparency at its core." },
                { title: "Quality over Quantity", desc: "We prioritize meaningful interactions and high-quality content." },
                { title: "Community Driven", desc: "Our community shapes the direction of the platform." },
                { title: "Continuous Innovation", desc: "We constantly evolve to meet the needs of our users." },
              ].map((v) => (
                <div key={v.title} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
