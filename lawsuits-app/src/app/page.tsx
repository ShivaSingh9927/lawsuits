import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { HomeFittingForm } from "@/components/home/home-fitting-form";
import { TrustBar } from "@/components/home/trust-bar";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <HomeFittingForm />
    </div>
  );
}
