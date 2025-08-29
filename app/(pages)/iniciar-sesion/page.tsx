import { HeaderSection } from "../../../components/sections/header-section";
import { LoginPageContent } from "../../../components/sections/login-page-content";
import { PageLayout } from "../../../components/layout/page-layout";

export default function IniciarSesionPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <LoginPageContent />
    </PageLayout>
  );
}
