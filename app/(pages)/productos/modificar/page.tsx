import { Header } from "components/header"
import { ModificarProductoPageContent } from "components/sections/modificar-producto-page-content"
import { PageLayout } from "components/layout/page-layout"

export default function ModificarProductoPage() {
  return (
    <PageLayout>
      <Header />
      <ModificarProductoPageContent />
    </PageLayout>
  )
}
