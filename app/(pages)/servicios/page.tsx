import { HeaderSection } from "../../../components/sections/header-section";
import { ServicesPageContent } from "../../../components/sections/services-page-content";
import { PageLayout } from "../../../components/layout/page-layout";
import { FooterSection } from "components/sections/footer-section";

export default function ServiciosPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <ServicesPageContent />
      <FooterSection />
    </PageLayout>
  );
}
