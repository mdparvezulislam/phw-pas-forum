import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  FeatureGrid,
  Testimonials,
  MarketplaceShowcase,
  PremiumSection,
  FAQSection,
  CTASection,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "BHW PAS — Build. Learn. Network. Earn.",
  description:
    "Join thousands of entrepreneurs, marketers, developers and creators sharing knowledge, growing businesses and selling services.",
  openGraph: {
    title: "BHW PAS — Build. Learn. Network. Earn.",
    description:
      "The Modern Community Platform for Entrepreneurs, Marketers, Creators and Digital Professionals.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Testimonials />
      <CategoryGrid />
      <MarketplaceShowcase />
      <FeatureGrid />
      <PremiumSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
