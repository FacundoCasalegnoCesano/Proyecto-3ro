import { Header } from "components/header";
import { AgregarProductoPageContent } from "components/sections/agregar-producto-page-content";
import { PageLayout } from "components/layout/page-layout";
import { verifyAdminRole } from "lib/auth-utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgregarProductoPage() {
  const admin = await verifyAdminRole();
  if (!admin.isAdmin) redirect(admin.status === 401 ? "/iniciar-sesion" : "/productos");

  return (
    <PageLayout>
      <Header />
      <AgregarProductoPageContent />
    </PageLayout>
  );
}
