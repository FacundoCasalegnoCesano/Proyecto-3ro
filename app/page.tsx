import { HeaderSection } from "../components/sections/header-section"
import { HeroSection } from "../components/sections/hero-section"
import { ProductsSection } from "../components/sections/products-section"
import { NavigationSection } from "../components/sections/navigation-section"
import { FooterSection } from "../components/sections/footer-section"
import { PageLayout } from "../components/layout/page-layout"

export default function HomePage() {
  return (
    <PageLayout>
      <HeaderSection />
      <HeroSection />
      <ProductsSection />
      <NavigationSection />
      <ProductsSection showTitle={false} className="border-t-0" />
      <FooterSection />
    </PageLayout>
  )
}
