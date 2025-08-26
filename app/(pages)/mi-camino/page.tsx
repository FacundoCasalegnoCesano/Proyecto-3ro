import { HeaderSection } from "components/sections/header-section"
import { MiCaminoPageContent } from "components/sections/mi-camino-page-content"
import { PageLayout } from "components/layout/page-layout"

export default function MiCaminoPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <MiCaminoPageContent />
    </PageLayout>
  )
}
