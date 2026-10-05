import { HeaderSection } from "../components/sections/header-section";
import { HeroSection } from "../components/sections/hero-section";
import { ProductsSection } from "../components/sections/products-section";
import { NavigationSection } from "../components/sections/navigation-section";
import { FooterSection } from "../components/sections/footer-section";
import { PageLayout } from "../components/layout/page-layout";
import { EcoFriendlySection } from "components/sections/eco-friendly-section";
import { BrandsSection } from "components/sections/brands-section";

export default function HomePage() {
  return (
    <PageLayout>
      <HeaderSection />
      <HeroSection />
      <div>
        <ProductsSection
          title=" MAS VENDIDOS"
          productIds={[41, 42, 3, 36, 2,7,11,10]}
        />
      </div>
      <BrandsSection />
      <NavigationSection />
      <ProductsSection title=" RECOMENDADOS" productIds={[25, 8, 19,12,15,16,18]} />
      <EcoFriendlySection />
      <FooterSection />
    </PageLayout>
  );
}
