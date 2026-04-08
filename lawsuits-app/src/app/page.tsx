import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TrustBar } from "@/components/home/trust-bar";
import { HowItWorks } from "@/components/home/how-it-works";
import { FitTypes } from "@/components/home/fit-types";
import { ComboSection } from "@/components/home/combo-section";
import { HomeFittingForm } from "@/components/home/home-fitting-form";

export default function HomePage() {
  return (
    <div className="bg-[#FDFCFB]">
      <Hero />
      <CategoryGrid />
      <ComboSection />
      <FeaturedProducts />
      <HowItWorks />
      <HomeFittingForm />
    </div>
  );
}
