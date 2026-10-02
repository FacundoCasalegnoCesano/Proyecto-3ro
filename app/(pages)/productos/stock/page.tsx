import { Header } from "components/header";
import { StockPageContent } from "components/sections/stock-page-content";
import { PageLayout } from "components/layout/page-layout";
import { verifyAdminRole } from "lib/auth-utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const admin = await verifyAdminRole();
  if (!admin.isAdmin) redirect(admin.status === 401 ? "/iniciar-sesion" : "/productos");

  return (
    <PageLayout>
      <Header />
      <StockPageContent />
    </PageLayout>
  )
}
