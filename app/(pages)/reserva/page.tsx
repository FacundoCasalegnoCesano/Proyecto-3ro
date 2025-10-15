import { Header } from "components/header";
import { ReservaPageContent } from "components/sections/reserva-page-content";
import { PageLayout } from "components/layout/page-layout";

export default function ReservaPage() {
  return (
    <PageLayout>
      <Header />
      <ReservaPageContent />
    </PageLayout>
  );
}
