import { HeaderSection } from "../../../components/sections/header-section";
import { ProductsPageContent } from "../../../components/sections/products-page-content";
import { PageLayout } from "../../../components/layout/page-layout";
import { FooterSection } from "components/sections/footer-section";

export default function ProductosPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <ProductsPageContent />
      <FooterSection />
    </PageLayout>
  );
}
