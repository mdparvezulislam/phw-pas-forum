"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-24">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[800px] rounded-full bg-premium/10 blur-[120px]" />
        </div>
        <div className="absolute right-0 top-1/3">
          <div className="h-[400px] w-[400px] rounded-full bg-marketplace/10 blur-[100px]" />
        </div>
        <div className="absolute bottom-0 left-0">
          <div className="h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pt-20 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-premium/20 bg-premium/5 px-3.5 py-1 text-xs font-medium text-premium">
            <Sparkles className="h-3 w-3" />
            The Modern Community Platform
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build. Learn.
            <br />
            <span className="text-gradient">Network & Earn.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Join thousands of entrepreneurs, marketers, developers, and creators sharing
            knowledge, growing businesses, and selling services.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Join Community
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-3.5 text-sm font-semibold transition-all hover:bg-accent"
            >
              Explore Marketplace
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "50K+", label: "Members" },
              { value: "100K+", label: "Discussions" },
              { value: "10K+", label: "Listings" },
              { value: "25K+", label: "Orders" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
