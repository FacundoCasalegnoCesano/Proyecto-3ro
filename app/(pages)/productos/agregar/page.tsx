import { Header } from "components/header";
import { AgregarProductoPageContent } from "components/sections/agregar-producto-page-content";
import { PageLayout } from "components/layout/page-layout";

export default function AgregarProductoPage() {
  return (
    <PageLayout>
      <Header />
      <AgregarProductoPageContent />
    </PageLayout>
  );
}
