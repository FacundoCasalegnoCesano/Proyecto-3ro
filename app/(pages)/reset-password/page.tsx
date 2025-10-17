import { HeaderSection } from "../../../components/sections/header-section";
import { ResetPasswordPageContent } from "../../../components/sections/reset-password-page-content";
import { PageLayout } from "../../../components/layout/page-layout";

export default function ResetPasswordPage() {
  return (
    <PageLayout>
      <HeaderSection />
      <ResetPasswordPageContent />
    </PageLayout>
  );
}
