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
          productIds={[60002, 90001, 180002, 60001, 30001,360009,360012,270001]}
        />
      </div>
      <BrandsSection />
      <NavigationSection />
      <ProductsSection title="PRODUCTOS RECOMENDADOS" productIds={[180001, 150002, 30002,360005,360007,360002,360010]} />
      <EcoFriendlySection />
      <FooterSection />
    </PageLayout>
  );
}
