// app/(pages)/configuracion/page.tsx
import { ConfigurationPageContent } from "components/sections/configuration-page-content"
import { Header } from "components/header"
import { PageLayout } from "components/layout/page-layout"

export default function ConfiguracionPage() {
  return (
    <PageLayout>
      <Header />
      <ConfigurationPageContent />
    </PageLayout>
  )
}