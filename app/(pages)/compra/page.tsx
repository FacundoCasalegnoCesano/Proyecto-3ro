import { Header } from "components/header"
import { CompraPageContent } from "components/sections/compra-page-content"
import { PageLayout } from "components/layout/page-layout"

export default function CompraPage() {
  return (
    <PageLayout>
      <Header />
      <CompraPageContent />
    </PageLayout>
  )
}
