import { HeaderSection } from "../../../components/sections/header-section"
import { RegisterPageContent } from "../../../components/sections/register-page-content"
import { PageLayout } from "../../../components/layout/page-layout"

export default function RegistrarUsuarioPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <RegisterPageContent />
    </PageLayout>
  )
}
