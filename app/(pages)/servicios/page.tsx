import { HeaderSection } from "../../../components/sections/header-section"
import { ServicesPageContent } from "../../../components/sections/services-page-content"
import { PageLayout } from "../../../components/layout/page-layout"

export default function ServiciosPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <ServicesPageContent />
    </PageLayout>
  )
}