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
          title="PRODUCTOS MAS VENDIDOS"
          productIds={[4, 5, 3, 6, 1]}
        />
      </div>
      <EcoFriendlySection />
      <NavigationSection />
      <ProductsSection title="PRODUCTOS RECOMENDADOS" productIds={[7, 8, 2]} />
      <BrandsSection />
      <FooterSection />
    </PageLayout>
  );
}
