import { Header } from "components/header"
import { StockPageContent } from "components/sections/stock-page-content"
import { PageLayout } from "components/layout/page-layout"

export default function StockPage() {
  return (
    <PageLayout>
      <Header />
      <StockPageContent />
    </PageLayout>
  )
}
