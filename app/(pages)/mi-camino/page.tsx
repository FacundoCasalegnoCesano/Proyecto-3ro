import { HeaderSection } from "components/sections/header-section";
import { MiCaminoPageContent } from "components/sections/mi-camino-page-content";
import { PageLayout } from "components/layout/page-layout";
import { FooterSection } from "components/sections/footer-section";

export default function MiCaminoPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <MiCaminoPageContent />
      <FooterSection />
    </PageLayout>
  );
}
