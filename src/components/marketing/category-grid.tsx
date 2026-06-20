import Link from "next/link";
import {
  Search,
  TrendingUp,
  Bot,
  Code,
  Briefcase,
  Film,
  Music,
  BarChart3,
  Users,
  Rocket,
} from "lucide-react";

const categories = [
  { name: "SEO", icon: Search, count: "2,340 discussions", href: "/forums/seo" },
  { name: "Marketing", icon: TrendingUp, count: "4,120 discussions", href: "/forums/marketing" },
  { name: "AI", icon: Bot, count: "3,890 discussions", href: "/forums/ai" },
  { name: "Programming", icon: Code, count: "5,670 discussions", href: "/forums/programming" },
  { name: "Business", icon: Briefcase, count: "3,210 discussions", href: "/forums/business" },
  { name: "YouTube", icon: Film, count: "2,980 discussions", href: "/forums/youtube" },
  { name: "TikTok", icon: Music, count: "1,870 discussions", href: "/forums/tiktok" },
  { name: "Growth", icon: BarChart3, count: "2,450 discussions", href: "/forums/growth" },
  { name: "Freelancing", icon: Users, count: "1,560 discussions", href: "/forums/freelancing" },
  { name: "Startups", icon: Rocket, count: "2,100 discussions", href: "/forums/startups" },
];

export function CategoryGrid() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Explore Communities</h2>
          <p className="mt-3 text-muted-foreground">
            Join discussions in your favorite topics
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-premium/30 hover:shadow-lg hover:shadow-premium/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-premium/10 text-premium transition-colors group-hover:bg-premium/20">
                <cat.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
