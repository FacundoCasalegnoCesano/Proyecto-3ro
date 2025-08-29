
import { HeaderSection } from "../../../../components/sections/header-section"
import { ProductDetailContent } from "../../../../components/sections/product-detail-content"
import { PageLayout } from "../../../../components/layout/page-layout"
import { FooterSection } from "components/sections/footer-section"


interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <PageLayout>
      <HeaderSection />
      <ProductDetailContent productId={params.id} />
      <FooterSection  />
    </PageLayout>
  );
}

